/**
 * Wizard service.
 *
 * Phase 1 (NL prompt → staged SKUs) and Phase 2 (save campaign) are now
 * wired to the real backend. Stores / margins / durations / hardware remain
 * as static data because those endpoints don't exist in the backend yet.
 *
 * The init→chat flow uses the LangGraph-backed endpoints:
 *   POST /campaigns/init   → creates DB row + thread
 *   POST /campaigns/{id}/chat → conversational AI turn
 */

import {
  MOCK_DURATIONS,
  MOCK_HARDWARE_DEVICES,
  MOCK_MARGINS,
  MOCK_STORES,
} from "@/mocks/wizard";
import { chatCampaign, draftCampaignFromPrompt, initCampaign } from "@/services/campaigns";
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
): Promise<{ aiReply: ChatMessage; skus: StagedSku[]; sessionId: string }> {
  const response = await draftCampaignFromPrompt({
    prompt,
    source_type: "nl",
  });

  const skus: StagedSku[] = response.skus.map((s) => ({
    sku: s.sku,
    name: s.product_name ?? s.name ?? "",
    current: s.current_price,
    proposed: s.proposed_price,
    safe: s.is_safe,
    margin: `${s.margin_pct}%`,
    included: true,
  }));

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

// ─── Init → Chat flow (LangGraph-backed) ─────────────────────────────────────

export interface WizardSession {
  campaignId: string;
  threadId: string;
}

/**
 * Initialize a new campaign session with LangGraph.
 * Returns the campaign_id and langgraph_thread_id needed for chat.
 */
export async function initWizardCampaign(
  sourceType: "nl" | "manual" = "nl",
): Promise<WizardSession> {
  const res = await initCampaign({ source_type: sourceType });
  return {
    campaignId: res.campaign_id,
    threadId: res.langgraph_thread_id,
  };
}

/**
 * Send a conversational message to the LangGraph agent.
 * Returns the AI reply and updated staged SKUs for the grid.
 */
export async function chatWizardMessage(
  campaignId: string,
  message: string,
  constraints: WizardConstraints,
): Promise<{ aiReply: ChatMessage; skus: StagedSku[] }> {
  const res = await chatCampaign(campaignId, { message });

  const skus: StagedSku[] = (res.staged_skus ?? []).map((s) => ({
    sku: s.sku ?? "",
    name: s.product_name ?? s.name ?? "",
    current: s.current_price ?? 0,
    proposed: s.proposed_price ?? 0,
    safe: s.is_safe ?? true,
    margin: `${s.margin_pct ?? 0}%`,
    included: true,
  }));

  let replyText = res.reply || "AI processed your request.";

  if (skus.length > 0) {
    const safeCount = skus.filter((s) => s.safe).length;
    const warnCount = skus.length - safeCount;
    replyText += `\n\nFound <strong>${skus.length}</strong> SKUs`;
    if (warnCount > 0) {
      replyText += `. <span class="text-rose-400 font-medium">${warnCount} item${warnCount > 1 ? "s" : ""} below the ${constraints.marginFloor} margin floor.</span>`;
    } else {
      replyText += `. All items clear the ${constraints.marginFloor} margin floor.`;
    }
    replyText += " Please review the staging grid.";
  }

  return {
    aiReply: { role: "ai", text: replyText },
    skus,
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
