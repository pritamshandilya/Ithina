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
import { formatIsoRangeUsShort, normalizeDraftScheduleForParsing } from "@/lib/wizard-datetime";
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
  return {
    campaignThemeName: themeRaw || null,
    scheduleStartIso: normalizeDraftScheduleForParsing(scheduleStartRaw, "start"),
    scheduleEndIso: normalizeDraftScheduleForParsing(scheduleEndRaw, "end"),
  };
}

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

export async function submitWizardIntent(
  prompt: string,
  _constraints: WizardConstraints,
  options?: { sessionId?: string | null },
): Promise<{ aiReply: ChatMessage; skus: StagedSku[]; sessionId: string; draftMeta: DraftCampaignMeta; suggestions: string[] }> {
  const response = await draftCampaignFromPrompt({
    prompt,
    source_type: "nl",
    ...(options?.sessionId ? { session_id: options.sessionId } : {}),
  });

  const draftMeta = extractDraftMeta(response);
  const campaignWindowLabel = formatIsoRangeUsShort(draftMeta.scheduleStartIso, draftMeta.scheduleEndIso);

  const skus: StagedSku[] = response.skus.map((s) => {
    const current = s.current_price;
    const proposed = s.proposed_price;
    const discount = current > 0 ? Math.round(((current - proposed) / current) * 100) : 0;
    const eslRaw = s.esl_id ?? s.ESL_ID ?? undefined;
    const rankingScore = typeof s.score === "number" && !Number.isNaN(s.score) ? s.score : undefined;
    const rowSchedule = pickAgentSuggestScheduleLabel(s) ?? campaignWindowLabel ?? undefined;
    const offerType =
      s.offer_type?.trim() || s.offerType?.trim() || undefined;
    const offerLabel =
      s.offer_label?.trim() || s.offerLabel?.trim() || undefined;
    const stockRaw = s.stock_qty ?? s.stockQty;
    const stockQty =
      typeof stockRaw === "number" && !Number.isNaN(stockRaw) ? stockRaw : undefined;
    return {
      sku: s.sku,
      name: s.product_name ?? s.name ?? "",
      current,
      proposed,
      safe: s.is_safe,
      violationReason: s.violation_reason ?? null,
      margin: `${s.margin_pct}%`,
      baseCost: s.base_cost,
      discount,
      included: true,
      isFree: s.is_free === true || s.isFree === true,
      ...(eslRaw ? { eslId: String(eslRaw) } : {}),
      ...(rankingScore !== undefined ? { rankingScore } : {}),
      ...(rowSchedule ? { agentSuggestSchedule: rowSchedule } : {}),
      ...(offerType ? { offerType } : {}),
      ...(offerLabel ? { offerLabel } : {}),
      ...(stockQty !== undefined ? { stockQty } : {}),
    };
  });

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
