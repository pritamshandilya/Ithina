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

export function useWizardStores() {
  return useQuery({ queryKey: ["wizard", "stores"], queryFn: getWizardStores });
}

export function useWizardMargins() {
  return useQuery({ queryKey: ["wizard", "margins"], queryFn: getWizardMargins });
}

export function useWizardDurations() {
  return useQuery({ queryKey: ["wizard", "durations"], queryFn: getWizardDurations });
}

export function useHardwareDevices() {
  return useQuery({ queryKey: ["wizard", "devices"], queryFn: getHardwareDevices });
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
