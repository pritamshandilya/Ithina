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
  ApiCampaignChatMessageRequest,
  ApiCampaignChatRequest,
  ApiCampaignChatResponse,
  ApiCampaignDraftRequest,
  ApiCampaignDraftResponse,
  ApiCampaignEventResponse,
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

function newPipelineSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Maps wizard schedule fields to API generate payload (nullable when unscheduled). */
function scheduleFieldsFromWizardStep(schedule: {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime?: string;
}): Pick<ApiCampaignGenerateRequest, "scheduled_start" | "scheduled_end" | "scheduled_time"> {
  if (!schedule.startDate?.trim()) {
    return { scheduled_start: null, scheduled_end: null, scheduled_time: null };
  }
  const scheduled_time = schedule.startTime ? schedule.startTime.slice(0, 10) : null;
  const start = new Date(`${schedule.startDate}T${schedule.startTime || "00:00"}:00`);
  const scheduled_start = Number.isNaN(start.getTime()) ? null : start.toISOString();
  let scheduled_end: string | null = null;
  if (schedule.endDate?.trim()) {
    const endT = (schedule.endTime ?? schedule.startTime) || "00:00";
    const end = new Date(`${schedule.endDate}T${endT}:00`);
    if (!Number.isNaN(end.getTime())) scheduled_end = end.toISOString();
  }
  return { scheduled_start, scheduled_end, scheduled_time };
}

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

  const displayInitiator = api.initiator_name?.trim() || api.initiator_id;
  const displayApprover = api.approver_name?.trim() || api.approver_id || undefined;

  return {
    id: api.id,
    name: api.name,
    status: uiStatus,
    apiStatus: api.status,
    skus: api.skus.length,
    hardware: api.hardware_targets ?? [],
    createdAt: api.created_at,
    // All Campaigns date should reflect creation time.
    date: new Date(api.created_at).toLocaleDateString(),
    initiator: displayInitiator,
    pipeline: derivePipeline(uiStatus, { isPending, isApproved, isRejected }),
    paused: uiStatus === "Scheduled" ? false : undefined,
    ownerId: api.initiator_id,
    ownerName: displayInitiator,
    submittedForApproval: isPending || isApproved || isRejected,
    approvalStatus: isApproved ? "approved" : isRejected ? "rejected" : "pending",
    reviewedById: api.approver_id ?? undefined,
    reviewedByName: displayApprover,
    reviewedAt: api.updated_at,
    publishedAt: api.published_at ?? undefined,
    scheduledAt: api.scheduled_start ?? undefined,
    scheduledEndAt: api.scheduled_end ?? undefined,
    scheduledTime: api.scheduled_time ?? undefined,
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

export async function rejectCampaign(id: string): Promise<CampaignListItem> {
  const { data } = await promoApiClient.post<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/${id}/reject`,
  );
  return adaptApiCampaign(data);
}

/**
 * Send a conversational message to the LangGraph agent for a campaign.
 * Returns the AI reply text and the full updated SKU grid.
 */
export async function chatCampaign(
  campaignId: string,
  payload: ApiCampaignChatRequest,
): Promise<ApiCampaignChatResponse> {
  const { data } = await promoApiClient.post<ApiCampaignChatResponse>(
    `${API_PREFIX}/campaigns/${campaignId}/chat`,
    payload,
  );
  return data;
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

  let scheduled_start: string | null = null;
  let scheduled_end: string | null = null;
  let scheduled_time: string | null = null;
  if (form.scheduled_date?.trim()) {
    const start = new Date(`${form.scheduled_date}T00:00:00`);
    if (!Number.isNaN(start.getTime())) {
      scheduled_start = start.toISOString();
    }
  }

  return generateCampaign({
    session_id: newPipelineSessionId(),
    name: form.name,
    hardware_targets: hardware,
    scheduled_start,
    scheduled_end,
    scheduled_time,
  });
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

export async function deleteCampaign(id: string): Promise<void> {
  await promoApiClient.delete(`${API_PREFIX}/campaigns/${id}`);
}

export async function getCampaign(id: string): Promise<CampaignListItem> {
  const { data } = await promoApiClient.get<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/${id}`,
  );
  return adaptApiCampaign(data);
}

export async function getCampaignTimeline(
  campaignId: string,
): Promise<ApiCampaignEventResponse[]> {
  const { data } = await promoApiClient.get<ApiCampaignEventResponse[]>(
    `${API_PREFIX}/campaigns/${campaignId}/events`,
  );
  return data;
}

export async function postCampaignChat(
  campaignId: string,
  payload: ApiCampaignChatMessageRequest,
): Promise<ApiCampaignEventResponse> {
  const { data } = await promoApiClient.post<ApiCampaignEventResponse>(
    `${API_PREFIX}/campaigns/${campaignId}/chat`,
    payload,
  );
  return data;
}

/**
 * Used internally by approval.ts to fetch the full unfiltered list.
 * Since the backend already scopes by store and the JWT determines what
 * the user can see, we simply call getCampaignList.
 */
export async function getAllWorkflowCampaigns(): Promise<CampaignListItem[]> {
  return getCampaignList();
}

export interface WizardGenerateOptions {
  /** Draft LangGraph `session_id` from /campaigns/draft; falls back to a new UUID. */
  sessionId: string;
  schedule: {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime?: string;
  };
}

/**
 * Wizard convenience – called on final submit after the schedule step.
 */
export async function createCampaignFromWizard(
  name: string,
  hardwareTargets: string[],
  options: WizardGenerateOptions,
): Promise<CampaignListItem> {
  const { sessionId, schedule } = options;
  const schedulePayload = scheduleFieldsFromWizardStep(schedule);
  return generateCampaign({
    session_id: sessionId,
    name,
    hardware_targets: hardwareTargets,
    ...schedulePayload,
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
