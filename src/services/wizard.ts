import {
  MOCK_DURATIONS,
  MOCK_HARDWARE_DEVICES,
  MOCK_MARGINS,
  MOCK_STAGED_SKUS,
  MOCK_STORES,
} from "@/mocks/wizard";
<<<<<<< Updated upstream
=======
import { apiDelay } from "@/lib/api-delay";
import { fetchStores } from "@/services/store-api";
>>>>>>> Stashed changes
import type {
  ChatMessage,
  HardwareDevice,
  StagedSku,
  WizardConstraints,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";

export async function getWizardStores(): Promise<WizardStore[]> {
<<<<<<< Updated upstream
  return MOCK_STORES;
=======
  try {
    const stores = await fetchStores();
    return stores.map((store) => ({
      id: store.id,
      name: store.name,
      short: `#${store.id.slice(0, 8)}`,
      address: store.address,
      displays: 0,
      activePromos: 0,
    }));
  } catch {
    await apiDelay(300);
    return MOCK_STORES;
  }
>>>>>>> Stashed changes
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

export async function submitWizardIntent(
  _prompt: string,
  _constraints: WizardConstraints,
): Promise<{ aiReply: ChatMessage; skus: StagedSku[] }> {
  return {
    aiReply: {
      role: "ai",
      text: `I have queried the live ROOS inventory and applied your requested markdown.\n\nI found 3 SKUs. <span class="text-rose-400 font-medium">Notice: One item drops below your ${_constraints.marginFloor} margin floor.</span> Please review the staging grid.`,
    },
    skus: MOCK_STAGED_SKUS,
  };
}

export async function confirmHardwareSelection(
  deviceIds: string[],
): Promise<ChatMessage> {
<<<<<<< Updated upstream
=======
  void deviceIds;
  await apiDelay(600);
>>>>>>> Stashed changes
  return {
    role: "ai",
    text: "Configuring layout parameters for selected hardware targets. Resolving product assets and generating digital backgrounds...",
  };
}
