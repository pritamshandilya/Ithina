import { useMutation, useQuery } from "@tanstack/react-query";

import {
  discoverCsvFields,
  processCsvMapping,
  saveDraftCampaign,
} from "@/services/campaigns";
import {
  confirmHardwareSelection,
  getHardwareDevices,
  getWizardDurations,
  getWizardMargins,
  getWizardStores,
  submitWizardIntent,
} from "@/services/wizard";
import type { ApiCampaignCSVProcessRequest } from "@/types/api/campaigns";
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
    mutationFn: ({
      text,
      constraints,
      sessionId,
      signal,
    }: {
      text: string;
      constraints: WizardConstraints;
      sessionId?: string | null;
      signal?: AbortSignal;
    }) => submitWizardIntent(text, constraints, { sessionId, signal }),
  });
}

export function useConfirmHardwareSelection() {
  return useMutation({
    mutationFn: (deviceIds: HardwareDeviceId[]) => confirmHardwareSelection(deviceIds),
  });
}

export function useDiscoverCsvFields() {
  return useMutation({
    mutationFn: (file: File) => discoverCsvFields(file),
  });
}

export function useProcessCsvMapping() {
  return useMutation({
    mutationFn: (payload: ApiCampaignCSVProcessRequest) => processCsvMapping(payload),
  });
}

export function useSaveDraftCampaign() {
  return useMutation({
    mutationFn: (payload: {
      session_id: string;
      hardware_targets: string[];
      name?: string;
      scheduled_start?: string | null;
      scheduled_end?: string | null;
      scheduled_time?: string | null;
    }) => saveDraftCampaign(payload),
  });
}

