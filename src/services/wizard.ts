import {
  MOCK_DURATIONS,
  MOCK_HARDWARE_DEVICES,
  MOCK_MARGINS,
  MOCK_STAGED_SKUS,
  MOCK_STORES,
} from "@/mocks/wizard";
import { apiDelay } from "@/lib/api-delay";
import type {
  ChatMessage,
  HardwareDevice,
  StagedSku,
  WizardConstraints,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";

// TODO (backend): replace with axios.get("/api/wizard/stores")
export async function getWizardStores(): Promise<WizardStore[]> {
  await apiDelay(300);
  return MOCK_STORES;
}

// TODO (backend): replace with axios.get("/api/wizard/margins")
export async function getWizardMargins(): Promise<WizardMargin[]> {
  await apiDelay(200);
  return MOCK_MARGINS;
}

// TODO (backend): replace with axios.get("/api/wizard/durations")
export async function getWizardDurations(): Promise<WizardDuration[]> {
  await apiDelay(200);
  return MOCK_DURATIONS;
}

// TODO (backend): replace with axios.get("/api/wizard/hardware")
export async function getHardwareDevices(): Promise<HardwareDevice[]> {
  await apiDelay(300);
  return MOCK_HARDWARE_DEVICES;
}

// TODO (backend): replace with axios.post("/api/wizard/intent")
export async function submitWizardIntent(
  _prompt: string,
  _constraints: WizardConstraints,
): Promise<{ aiReply: ChatMessage; skus: StagedSku[] }> {
  await apiDelay(800);
  return {
    aiReply: {
      role: "ai",
      text: `I have queried the live ROOS inventory and applied your requested markdown.\n\nI found 3 SKUs. <span class="text-rose-400 font-medium">Notice: One item drops below your ${_constraints.marginFloor} margin floor.</span> Please review the staging grid.`,
    },
    skus: MOCK_STAGED_SKUS,
  };
}

// TODO (backend): replace with axios.post("/api/wizard/hardware-confirm")
export async function confirmHardwareSelection(
  _deviceIds: string[],
): Promise<ChatMessage> {
  await apiDelay(600);
  return {
    role: "ai",
    text: "Configuring layout parameters for selected hardware targets. Resolving product assets and generating digital backgrounds...",
  };
}
