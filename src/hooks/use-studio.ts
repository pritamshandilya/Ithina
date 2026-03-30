import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAssetInfo,
  getComplianceChecks,
  getHwOptions,
  getInitialMessage,
  getLayoutVariants,
  getRecentCampaigns,
  getRendererSpec,
  selectVariant,
  submitChatRefine,
  switchHardware,
} from "@/services/studio";
import type { HardwareDeviceId } from "@/types/wizard";
import type { VariantId } from "@/types/studio";

export const studioKeys = {
  all: ["studio"] as const,
  hwOptions: ["studio", "hwOptions"] as const,
  variants: ["studio", "variants"] as const,
  compliance: ["studio", "compliance"] as const,
  spec: (hw: HardwareDeviceId) => ["studio", "spec", hw] as const,
  asset: ["studio", "asset"] as const,
  initialMsg: ["studio", "initialMsg"] as const,
  recentCampaigns: ["studio", "recentCampaigns"] as const,
};

export function useHwOptions() {
  return useQuery({
    queryKey: studioKeys.hwOptions,
    queryFn: getHwOptions,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useLayoutVariants() {
  return useQuery({
    queryKey: studioKeys.variants,
    queryFn: getLayoutVariants,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useComplianceChecks() {
  return useQuery({
    queryKey: studioKeys.compliance,
    queryFn: getComplianceChecks,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useRendererSpec(hw: HardwareDeviceId) {
  return useQuery({
    queryKey: studioKeys.spec(hw),
    queryFn: () => getRendererSpec(hw),
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useAssetInfo() {
  return useQuery({
    queryKey: studioKeys.asset,
    queryFn: getAssetInfo,
    staleTime: 0,
    gcTime: 5 * 60_000,
  });
}

export function useInitialMessage() {
  return useQuery({
    queryKey: studioKeys.initialMsg,
    queryFn: getInitialMessage,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useRecentCampaigns() {
  return useQuery({
    queryKey: studioKeys.recentCampaigns,
    queryFn: getRecentCampaigns,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useSelectVariant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: VariantId) => selectVariant(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studioKeys.compliance });
      qc.invalidateQueries({ queryKey: studioKeys.asset });
    },
  });
}

export function useSubmitChatRefine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ text, hw }: { text: string; hw: HardwareDeviceId }) =>
      submitChatRefine(text, hw),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studioKeys.compliance });
      qc.invalidateQueries({ queryKey: studioKeys.asset });
    },
  });
}

export function useSwitchHardware() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (label: string) => switchHardware(label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: studioKeys.compliance });
    },
  });
}
