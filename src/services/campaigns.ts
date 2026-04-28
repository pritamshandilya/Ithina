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
 *   draft                 → "Draft"
 *   generating / pending_approval → "Pending"
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
  ApiCampaignApproveRequest,
  ApiCampaignChatMessageRequest,
  ApiCampaignChatRequest,
  ApiCampaignChatResponse,
  ApiCampaignCSVDiscoverResponse,
  ApiCampaignCSVProcessRequest,
  ApiCampaignDraftRequest,
  ApiCampaignDraftResponse,
  ApiCampaignEventResponse,
  ApiCampaignGenerateRequest,
  ApiCampaignResponse,
  ApiCampaignSubmitRequest,
  ApiGuardrailsStatus,
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

/**
 * Pipeline breadcrumb: last item is the active stage.
 * - Data: NL draft / chat only (`draft`, no persisted assets yet).
 * - Design: `generating` (POST /campaigns/generate in flight or persisted as generating).
 * - Guard Rails: `draft` with pass/warn, or fail once SKUs/hardware exist (post-design review).
 * - Approval: `pending_approval` only (after submit).
 */
function derivePipelineFromSignals(params: {
  status: string;
  guardrails: ApiGuardrailsStatus;
  hasAssets: boolean;
}): string[] {
  const s = params.status;
  const gr = params.guardrails;
  const hasAssets = params.hasAssets;

  if (s === "approved" || s === "active") {
    return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
  }
  if (s === "rejected") {
    return ["Data", "Design", "Guard Rails", "Approval"];
  }
  if (s === "scheduled" || s === "publishing") {
    return ["Data", "Design", "Guard Rails", "Scheduled"];
  }
  if (s === "pending_approval") {
    return ["Data", "Design", "Guard Rails", "Approval"];
  }
  if (s === "generating") {
    return ["Data", "Design"];
  }
  if (s === "draft") {
    if (gr === "pass" || gr === "warn") {
      return ["Data", "Design", "Guard Rails"];
    }
    if (hasAssets) {
      // guardrails failed or not yet run — still at Design step
      return ["Data", "Design"];
    }
    return ["Data"];
  }
  return ["Data"];
}

function derivePipelineFromApi(api: ApiCampaignResponse): string[] {
  const hasAssets =
    (api.skus?.length ?? 0) > 0 || (api.hardware_targets?.length ?? 0) > 0;
  return derivePipelineFromSignals({
    status: api.status,
    guardrails: api.guardrails_status,
    hasAssets,
  });
}

/** Fallback when `apiStatus` is missing (legacy mocks). */
function legacyDerivePipelineFromUiStatus(status: CampaignListStatus): string[] {
  switch (status) {
    case "Active":
    case "Completed":
      return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
    case "Scheduled":
      return ["Data", "Design", "Guard Rails", "Scheduled"];
    case "Pending":
      return ["Data", "Design", "Guard Rails", "Approval"];
    case "Draft":
      return ["Data", "Design"];
    case "Rejected":
      return ["Data", "Design", "Guard Rails", "Approval"];
    default:
      return ["Data"];
  }
}

export function derivePipelineForRow(row: CampaignListItem): string[] {
  if (row.pipeline?.length) return row.pipeline;
  if (row.apiStatus) {
    return derivePipelineFromSignals({
      status: row.apiStatus,
      guardrails: row.guardrailsStatus ?? "fail",
      hasAssets: row.skus > 0 || (row.hardware?.length ?? 0) > 0,
    });
  }
  return legacyDerivePipelineFromUiStatus(row.status);
}

// ─── Response adapter ────────────────────────────────────────────────────────

function adaptApiCampaign(api: ApiCampaignResponse): CampaignListItem {
  const uiStatus = mapApiStatusToUi(api.status);
  const isApproved = api.status === "approved" || api.status === "active";
  const isRejected = api.status === "rejected";
  const submittedForApproval =
    api.status === "pending_approval" ||
    api.status === "approved" ||
    api.status === "active" ||
    api.status === "scheduled" ||
    api.status === "publishing" ||
    api.status === "rejected";

  const displayInitiator = api.initiator_name?.trim() || api.initiator_id;
  const displayApprover = api.approver_name?.trim() || api.approver_id || undefined;

  return {
    id: api.id,
    name: api.name,
    status: uiStatus,
    apiStatus: api.status,
    guardrailsStatus: api.guardrails_status,
    skus: api.skus.length,
    hardware: api.hardware_targets ?? [],
    createdAt: api.created_at,
    // All Campaigns date should reflect creation time.
    date: new Date(api.created_at).toLocaleDateString(),
    initiator: displayInitiator,
    pipeline: derivePipelineFromApi(api),
    paused: uiStatus === "Scheduled" ? false : undefined,
    ownerId: api.initiator_id,
    ownerName: displayInitiator,
    submittedForApproval,
    approvalStatus: isApproved ? "approved" : isRejected ? "rejected" : "pending",
    reviewedById: api.approver_id ?? undefined,
    reviewedByName: displayApprover,
    reviewedAt: api.updated_at,
    publishedAt: api.published_at ?? undefined,
    scheduledAt: api.scheduled_start ?? undefined,
    scheduledEndAt: api.scheduled_end ?? undefined,
    scheduledTime: api.scheduled_time ?? undefined,
    rawSkus: api.skus,
    sourceType: api.source_type,
    aiPrompt: api.ai_prompt,
  };
}

// ─── Core campaign API calls ─────────────────────────────────────────────────

/**
 * Lists all campaigns for the active store (`GET /api/v1/campaigns`).
 * In DevTools, the Name column may show only `campaigns`; open the row and confirm the
 * request URL has **no** trailing `/events` — that distinguishes this from {@link getCampaignTimeline}.
 */
export async function getCampaignList(): Promise<CampaignListItem[]> {
  const { data } = await promoApiClient.get<ApiCampaignResponse[]>(
    `${API_PREFIX}/campaigns`,
  );
  return data.map(adaptApiCampaign);
}

export async function submitCampaign(
  id: string,
  payload: ApiCampaignSubmitRequest,
): Promise<CampaignListItem> {
  const { data } = await promoApiClient.post<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/${id}/submit`,
    payload,
  );
  return adaptApiCampaign(data);
}

export async function approveCampaign(
  id: string,
  payload: ApiCampaignApproveRequest,
): Promise<CampaignListItem> {
  const { data } = await promoApiClient.post<ApiCampaignResponse>(
    `${API_PREFIX}/campaigns/${id}/approve`,
    payload,
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
 * CSV Step 1: upload file, receive headers + suggested column mapping + sample rows.
 */
export async function discoverCsvFields(
  file: File,
): Promise<ApiCampaignCSVDiscoverResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await promoApiClient.post<ApiCampaignCSVDiscoverResponse>(
    `${API_PREFIX}/campaigns/upload/discover`,
    formData,
  );
  return data;
}

/**
 * CSV Step 2: confirm mapping → LangGraph session + staged SKUs (same shape as draft).
 */
export async function processCsvMapping(
  payload: ApiCampaignCSVProcessRequest,
): Promise<ApiCampaignDraftResponse> {
  const { data } = await promoApiClient.post<ApiCampaignDraftResponse>(
    `${API_PREFIX}/campaigns/upload/process`,
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

/**
 * `/campaigns/{id}/events` may return a bare array or a wrapper object.
 * Always produce an array so React code can spread / iterate safely.
 */
export function normalizeCampaignEventsPayload(
  data: unknown,
): ApiCampaignEventResponse[] {
  if (Array.isArray(data)) return data as ApiCampaignEventResponse[];
  if (data != null && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["events", "data", "items", "results"] as const) {
      const v = o[key];
      if (Array.isArray(v)) return v as ApiCampaignEventResponse[];
    }
  }
  return [];
}

/**
 * Per-campaign timeline (`GET /api/v1/campaigns/{id}/events`). There is no app-wide `/events` route.
 * Used for polling until terminal pipeline events (e.g. `campaign_published` after checker approval).
 *
 * **DevTools:** Chrome often labels both this and {@link getCampaignList} as `campaigns` in the Network
 * **Name** column. Inspect **Request URL**: batch-render polling ends with `/campaigns/{uuid}/events`;
 * the store-scoped list is exactly `/api/v1/campaigns` with no id segment.
 */
export async function getCampaignTimeline(
  campaignId: string,
): Promise<ApiCampaignEventResponse[]> {
  const { data } = await promoApiClient.get<unknown>(
    `${API_PREFIX}/campaigns/${campaignId}/events`,
  );
  return normalizeCampaignEventsPayload(data);
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
