/**
 * Campaign service.
 *
 * All CRUD and workflow operations talk to the real FastAPI backend.
 * The `X-Store-Id` header is injected automatically by the promoApiClient
 * request interceptor (see lib/promo-api-client.ts).
 *
 * Status mapping:
 *   Backend               → Frontend UI
 *   ─────────────────────────────────────
 *   draft / generating    → "Draft"
 *   pending_approval      → "Draft"  (visible to maker as pending)
 *   approved / active     → "Active"
 *   scheduled             → "Scheduled"
 *   publishing            → "Scheduled"
 *   rejected              → "Rejected"
 *   (any completed state) → "Completed"  (future)
 */

import { promoApiClient } from "@/lib/promo-api-client";
import {
  MOCK_CALENDAR_WEEKDAYS,
  MOCK_CAMPAIGN_FILTERS,
  MOCK_CAMPAIGN_STAT_DEFINITIONS,
  MOCK_CAMPAIGN_STATUS_STYLES,
  MOCK_CAMPAIGN_TABLE_COLUMNS,
  MOCK_MONTH_NAMES,
} from "@/mocks/campaigns";
import type {
  ApiCampaignDraftRequest,
  ApiCampaignDraftResponse,
  ApiCampaignGenerateRequest,
  ApiCampaignResponse,
} from "@/types/api/campaigns";
import type {
  CampaignCreateForm,
  CampaignFilterOption,
  CampaignListItem,
  CampaignListStatus,
  CampaignStatDefinition,
  CampaignStatusStyle,
  CampaignTableColumn,
} from "@/types/campaigns";

const API_PREFIX = "/api/v1";

// ─── Status mapping ──────────────────────────────────────────────────────────

function mapApiStatusToUi(apiStatus: string): CampaignListStatus {
  switch (apiStatus) {
    case "active":
    case "approved":
      return "Active";
    case "scheduled":
    case "publishing":
      return "Scheduled";
    case "pending_approval":
    case "generating":
      return "Pending";
    case "rejected":
      return "Rejected";
    case "draft":
    default:
      return "Draft";
  }
}

function derivePipeline(
  status: CampaignListStatus,
  flags: { isPending: boolean; isApproved: boolean; isRejected: boolean },
): string[] {
  // Workflow-first pipeline rendering:
  // - pending submission should explicitly show Approval stage
  // - approved/live should show deploy stage
  // - rejected should show approval terminal state
  if (flags.isApproved || status === "Active") {
    return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
  }
  if (flags.isRejected || status === "Rejected") {
    return ["Data", "Design", "Guard Rails", "Approval"];
  }
  if (flags.isPending) {
    return ["Data", "Design", "Guard Rails", "Approval"];
  }
  if (status === "Scheduled") {
    return ["Data", "Design", "Guard Rails", "Scheduled"];
  }
  if (status === "Pending") {
    return ["Data", "Design", "Guard Rails", "Approval"];
  }
  if (status === "Draft") {
    return ["Data", "Design"];
  }
  return ["Data"];
}

// ─── Response adapter ────────────────────────────────────────────────────────

function adaptApiCampaign(api: ApiCampaignResponse): CampaignListItem {
  const uiStatus = mapApiStatusToUi(api.status);
  const isApproved = api.status === "approved" || api.status === "active";
  const isRejected = api.status === "rejected";
  // Backend currently persists newly submitted campaigns as "generating" before
  // a dedicated pending_approval transition endpoint exists.
  const isPending = api.status === "pending_approval" || api.status === "generating";

  return {
    id: api.id,
    name: api.name,
    status: uiStatus,
    skus: api.skus.length,
    hardware: api.hardware_targets ?? [],
    // All Campaigns date should reflect creation time.
    date: new Date(api.created_at).toLocaleDateString(),
    initiator: api.initiator_id,
    pipeline: derivePipeline(uiStatus, { isPending, isApproved, isRejected }),
    paused: uiStatus === "Scheduled" ? false : undefined,
    ownerId: api.initiator_id,
    ownerName: api.initiator_id,
    submittedForApproval: isPending || isApproved || isRejected,
    approvalStatus: isApproved ? "approved" : isRejected ? "rejected" : "pending",
    reviewedById: api.approver_id ?? undefined,
    reviewedByName: api.approver_id ?? undefined,
    reviewedAt: api.updated_at,
    publishedAt: api.published_at ?? undefined,
    scheduledAt: api.scheduled_start ?? undefined,
  };
}

// ─── Core campaign API calls ─────────────────────────────────────────────────

export async function getCampaignList(): Promise<CampaignListItem[]> {
  const { data } = await promoApiClient.get<ApiCampaignResponse[]>(
    `${API_PREFIX}/campaigns`,
  );
  return data.map(adaptApiCampaign);
}

export async function approveCampaign(id: string): Promise<CampaignListItem> {
  const { data } = await promoApiClient.post<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/${id}/approve`,
  );
  return adaptApiCampaign(data);
}

/**
 * Reject is not yet implemented in the backend. Until the endpoint is
 * available we optimistically update the local TanStack Query cache via
 * the hook layer (see use-campaigns.ts). This stub throws so callers
 * know it is not wired yet.
 *
 * TODO: replace once DELETE/PATCH reject endpoint is added to the backend.
 */
export async function rejectCampaign(_id: string): Promise<CampaignListItem> {
  throw new Error("reject_not_implemented");
}

/**
 * Phase 1 of the wizard: send NL prompt → get back staged SKUs.
 */
export async function draftCampaignFromPrompt(
  payload: ApiCampaignDraftRequest,
): Promise<ApiCampaignDraftResponse> {
  const { data } = await promoApiClient.post<ApiCampaignDraftResponse>(
    `${API_PREFIX}/campaigns/draft`,
    payload,
  );
  return data;
}

/**
 * Phase 2 of the wizard: persist the campaign to the database.
 * Returns the saved campaign mapped to the frontend shape.
 */
export async function generateCampaign(
  payload: ApiCampaignGenerateRequest,
): Promise<CampaignListItem> {
  const { data } = await promoApiClient.post<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/generate`,
    payload,
  );
  return adaptApiCampaign(data);
}

/**
 * Convenience wrapper used by the legacy campaign-modal create flow.
 * Maps the old CampaignCreateForm → generate endpoint.
 */
export async function createCampaign(form: CampaignCreateForm): Promise<CampaignListItem> {
  const hardware = form.hardware
    ? form.hardware
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  return generateCampaign({ name: form.name, hardware_targets: hardware });
}

/**
 * Update campaign – not yet exposed as a dedicated PATCH endpoint.
 * For now we re-use the generate endpoint to overwrite name/hardware.
 *
 * TODO: replace with PATCH /campaigns/{id} once available.
 */
export async function updateCampaign(
  _id: string,
  form: CampaignCreateForm,
): Promise<CampaignListItem> {
  return createCampaign(form);
}

/**
 * Delete campaign – no backend endpoint yet.
 *
 * TODO: replace with DELETE /campaigns/{id} once available.
 */
export async function deleteCampaign(_id: string): Promise<void> {
  throw new Error("delete_not_implemented");
}

/**
 * Used internally by approval.ts to fetch the full unfiltered list.
 * Since the backend already scopes by store and the JWT determines what
 * the user can see, we simply call getCampaignList.
 */
export async function getAllWorkflowCampaigns(): Promise<CampaignListItem[]> {
  return getCampaignList();
}

/**
 * Wizard convenience – called when the wizard completes the schedule step.
 */
export async function createCampaignFromWizard(
  name: string,
  _initiator: string = "Wizard",
  _scheduledDate: string = "",
  hardwareTargets: string[],
): Promise<CampaignListItem> {
  // TODO (backend): re-enable `scheduled_start` in generate payload once
  // CampaignGenerateRequest accepts it in promo_api_v1.
  return generateCampaign({
    name,
    hardware_targets: hardwareTargets,
  });
}

// ─── UI-only helpers (no backend equivalent yet) ─────────────────────────────

export async function getCampaignFilters(): Promise<CampaignFilterOption[]> {
  return MOCK_CAMPAIGN_FILTERS;
}

export async function getCampaignStatDefinitions(): Promise<CampaignStatDefinition[]> {
  return MOCK_CAMPAIGN_STAT_DEFINITIONS;
}

export async function getCampaignStatusStyles(): Promise<
  Record<CampaignListStatus, CampaignStatusStyle>
> {
  return MOCK_CAMPAIGN_STATUS_STYLES;
}

export async function getCampaignTableColumns(): Promise<CampaignTableColumn[]> {
  return MOCK_CAMPAIGN_TABLE_COLUMNS;
}

export async function getCalendarWeekdays(): Promise<string[]> {
  return MOCK_CALENDAR_WEEKDAYS;
}

export async function getMonthNames(): Promise<string[]> {
  return MOCK_MONTH_NAMES;
}
