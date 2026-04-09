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
import { draftCampaignFromPrompt } from "@/services/campaigns";
import type {
  ChatMessage,
  HardwareDevice,
  StagedSku,
  WizardConstraints,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";

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
  constraints: WizardConstraints,
  options?: { sessionId?: string | null },
): Promise<{ aiReply: ChatMessage; skus: StagedSku[]; sessionId: string }> {
  const response = await draftCampaignFromPrompt({
    prompt,
    source_type: "nl",
    ...(options?.sessionId ? { session_id: options.sessionId } : {}),
  });

  const skus: StagedSku[] = response.skus.map((s) => {
    const current = s.current_price;
    const proposed = s.proposed_price;
    const discount = current > 0 ? Math.round(((current - proposed) / current) * 100) : 0;
    return {
      sku: s.sku,
      name: s.product_name ?? s.name ?? "",
      current,
      proposed,
      safe: s.is_safe,
      margin: `${s.margin_pct}%`,
      baseCost: s.base_cost,
      discount,
      included: true,
    };
  });

  const safeCount = skus.filter((s) => s.safe).length;
  const warnCount = skus.length - safeCount;

  let replyText = response.message;
  replyText += `\n\nFound <strong>${skus.length}</strong> SKUs`;
  if (warnCount > 0) {
    replyText += `. <span class="text-rose-400 font-medium">${warnCount} item${warnCount > 1 ? "s" : ""} below the ${constraints.marginFloor} margin floor.</span>`;
  } else {
    replyText += `. All items clear the ${constraints.marginFloor} margin floor.`;
  }
  replyText += " Please review the staging grid.";

  return {
    aiReply: { role: "ai", text: replyText },
    skus,
    sessionId: response.session_id,
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
