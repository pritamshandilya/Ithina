/**
 * Wizard service.
 *
 * Phase 1 (NL prompt → staged SKUs) and Phase 2 (save campaign) are now
 * wired to the real backend. Stores / margins / durations / hardware remain
 * as static data because those endpoints don't exist in the backend yet.
 *
 * NL wizard turns use POST /campaigns/draft (LangGraph). Omit session_id on the
 * first message; the response includes session_id — send it on every follow-up.
 */

import {
  MOCK_DURATIONS,
  MOCK_HARDWARE_DEVICES,
  MOCK_MARGINS,
  MOCK_STORES,
} from "@/mocks/wizard";
import { inferNlDraftCampaignHintsFromMessage } from "@/lib/chat-message-format";
import { formatIsoRangeUsShort, normalizeDraftScheduleForParsing, parseNlScheduleRangeFromAssistantMessage } from "@/lib/wizard-datetime";
import {
  defaultIncludedForStagedSku,
} from "@/lib/staged-sku-margin-policy";
import { draftCampaignFromPrompt } from "@/services/campaigns";
import type { ApiCampaignDraftResponse, ApiCampaignSKU } from "@/types/api/campaigns";
import type {
  ChatMessage,
  HardwareDevice,
  StagedSku,
  WizardConstraints,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";

export interface DraftCampaignMeta {
  campaignThemeName: string | null;
  scheduleStartIso: string | null;
  scheduleEndIso: string | null;
}

function pickAgentSuggestScheduleLabel(s: ApiCampaignSKU): string | undefined {
  const raw =
    s.agent_suggest_schedule?.trim() ||
    s.suggested_schedule_label?.trim() ||
    s.schedule_hint?.trim() ||
    "";
  return raw || undefined;
}

/** Drop offer_label when it only repeats proposed price (legacy CSV import used "$X.XX"). */
function meaningfulOfferLabel(
  raw: string | undefined,
  proposed: number,
): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  const numeric = Number(t.replace(/[$,\s]/g, ""));
  if (!Number.isNaN(numeric) && Math.abs(numeric - proposed) < 0.02) {
    return undefined;
  }
  return t;
}

function extractDraftMeta(response: ApiCampaignDraftResponse): DraftCampaignMeta {
  const meta = response.campaign_meta;
  const themeRaw =
    response.campaign_theme_name?.trim() ||
    response.recommended_campaign_name?.trim() ||
    meta?.campaign_name?.trim() ||
    "";
  const scheduleStartRaw =
    response.recommended_schedule_start?.trim() ||
    response.suggested_schedule_start?.trim() ||
    meta?.schedule_start?.trim() ||
    null;
  const scheduleEndRaw =
    response.recommended_schedule_end?.trim() ||
    response.suggested_schedule_end?.trim() ||
    meta?.schedule_end?.trim() ||
    null;

  let scheduleStartIso = normalizeDraftScheduleForParsing(
    scheduleStartRaw,
    "start",
    meta?.scheduled_time,
  );
  let scheduleEndIso = normalizeDraftScheduleForParsing(scheduleEndRaw, "end");
  let campaignThemeName = themeRaw || null;

  if (response.message?.trim()) {
    const hints = inferNlDraftCampaignHintsFromMessage(response.message);
    if (!campaignThemeName && hints.campaignThemeName) {
      campaignThemeName = hints.campaignThemeName;
    }
    const nlSched = parseNlScheduleRangeFromAssistantMessage(response.message);
    if (!scheduleStartIso && nlSched.scheduleStartIso) {
      scheduleStartIso = nlSched.scheduleStartIso;
    }
    if (!scheduleEndIso && nlSched.scheduleEndIso) {
      scheduleEndIso = nlSched.scheduleEndIso;
    }
  }

  return {
    campaignThemeName,
    scheduleStartIso,
    scheduleEndIso,
  };
}

// Re-export for callers that import margin policy from the wizard service.
export {
  defaultIncludedForStagedSku,
  stagedSkuViolatesMarginPolicy,
} from "@/lib/staged-sku-margin-policy";

// ─── Static reference data (no backend equivalent yet) ───────────────────────

export async function getWizardStores(): Promise<WizardStore[]> {
  return MOCK_STORES;
}

export async function getWizardMargins(): Promise<WizardMargin[]> {
  return MOCK_MARGINS;
}

export async function getWizardDurations(): Promise<WizardDuration[]> {
  return MOCK_DURATIONS;
}

export async function getHardwareDevices(): Promise<HardwareDevice[]> {
  return MOCK_HARDWARE_DEVICES;
}

// ─── Phase 1: NL prompt → real backend draft ────────────────────────────────

/** One-decimal max; whole numbers stay integer (e.g. -20%, -58.3%). */
export function formatSkuMarginPercent(pct: number | undefined | null): string {
  if (typeof pct !== "number" || Number.isNaN(pct)) return "—";
  const rounded = Math.round(pct * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text}%`;
}

/** Maps draft API SKUs to staging grid rows (NL draft, CSV /upload/process, etc.). */
export function mapDraftResponseSkusToStaged(
  response: ApiCampaignDraftResponse,
  draftMeta?: DraftCampaignMeta,
): StagedSku[] {
  const meta = draftMeta ?? extractDraftMeta(response);
  const campaignWindowLabel = formatIsoRangeUsShort(meta.scheduleStartIso, meta.scheduleEndIso);

  return response.skus.map((s) => {
    const current = s.current_price;
    const proposed = s.proposed_price;
    const discount = current > 0 ? Math.round(((current - proposed) / current) * 100) : 0;
    const eslRaw = s.esl_id ?? s.ESL_ID ?? undefined;
    const rankingScore = typeof s.score === "number" && !Number.isNaN(s.score) ? s.score : undefined;
    const rowSchedule = pickAgentSuggestScheduleLabel(s) ?? campaignWindowLabel ?? undefined;
    const offerType =
      s.offer_type?.trim() || s.offerType?.trim() || undefined;
    const offerLabel = meaningfulOfferLabel(
      s.offer_label?.trim() || s.offerLabel?.trim() || undefined,
      proposed,
    );
    const stockRaw = s.stock_qty ?? s.stockQty;
    const stockQty =
      typeof stockRaw === "number" && !Number.isNaN(stockRaw) ? stockRaw : undefined;
    const marginPct =
      typeof s.margin_pct === "number" && !Number.isNaN(s.margin_pct) ? s.margin_pct : undefined;
    const marginPolicyRow = { safe: s.is_safe, marginPct };
    return {
      sku: s.sku,
      name: s.product_name ?? s.name ?? "",
      current,
      proposed,
      safe: s.is_safe,
      violationReason: s.violation_reason ?? null,
      margin: formatSkuMarginPercent(marginPct),
      ...(marginPct !== undefined ? { marginPct } : {}),
      baseCost: s.base_cost,
      discount,
      included: defaultIncludedForStagedSku(marginPolicyRow),
      isFree: s.is_free === true || s.isFree === true,
      ...(eslRaw ? { eslId: String(eslRaw) } : {}),
      ...(rankingScore !== undefined ? { rankingScore } : {}),
      ...(rowSchedule ? { agentSuggestSchedule: rowSchedule } : {}),
      ...(offerType ? { offerType } : {}),
      ...(offerLabel ? { offerLabel } : {}),
      ...(stockQty !== undefined ? { stockQty } : {}),
    };
  });
}

export async function submitWizardIntent(
  prompt: string,
  _constraints: WizardConstraints,
  options?: { sessionId?: string | null; signal?: AbortSignal },
): Promise<{ aiReply: ChatMessage; skus: StagedSku[]; sessionId: string; draftMeta: DraftCampaignMeta; suggestions: string[] }> {
  const response = await draftCampaignFromPrompt(
    {
      prompt,
      source_type: "nl",
      ...(options?.sessionId ? { session_id: options.sessionId } : {}),
    },
    options?.signal,
  );

  const draftMeta = extractDraftMeta(response);
  const skus = mapDraftResponseSkusToStaged(response, draftMeta);

  return {
    aiReply: { role: "ai", text: response.message },
    skus,
    sessionId: response.session_id,
    draftMeta,
    suggestions: response.suggestions ?? [],
  };
}

// ─── Phase 2 helper: hardware confirm message ────────────────────────────────

export async function confirmHardwareSelection(
  _deviceIds: string[],
): Promise<ChatMessage> {
  return {
    role: "ai",
    text: "Configuring layout parameters for selected hardware targets. Resolving product assets and generating digital backgrounds...",
  };
}
