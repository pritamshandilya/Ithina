import { useMutation, useQuery } from "@tanstack/react-query";

import {
  confirmHardwareSelection,
  getHardwareDevices,
  getWizardDurations,
  getWizardMargins,
  getWizardStores,
  submitWizardIntent,
} from "@/services/wizard";
import type { HardwareDeviceId, WizardConstraints } from "@/types/wizard";

export const wizardKeys = {
  all: ["wizard"] as const,
  stores: ["wizard", "stores"] as const,
  margins: ["wizard", "margins"] as const,
  durations: ["wizard", "durations"] as const,
  devices: ["wizard", "devices"] as const,
};

export function useWizardStores() {
  return useQuery({
    queryKey: wizardKeys.stores,
    queryFn: getWizardStores,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useWizardMargins() {
  return useQuery({
    queryKey: wizardKeys.margins,
    queryFn: getWizardMargins,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useWizardDurations() {
  return useQuery({
    queryKey: wizardKeys.durations,
    queryFn: getWizardDurations,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useHardwareDevices() {
  return useQuery({
    queryKey: wizardKeys.devices,
    queryFn: getHardwareDevices,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useSubmitWizardIntent() {
  return useMutation({
    mutationFn: ({ text, constraints }: { text: string; constraints: WizardConstraints }) =>
      submitWizardIntent(text, constraints),
  });
}

export function useConfirmHardwareSelection() {
  return useMutation({
    mutationFn: (deviceIds: HardwareDeviceId[]) => confirmHardwareSelection(deviceIds),
  });
}
