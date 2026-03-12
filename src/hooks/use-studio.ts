import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getAssetInfo,
  getComplianceChecks,
  getHwOptions,
  getInitialMessage,
  getLayoutVariants,
  getRendererSpec,
  selectVariant,
  submitChatRefine,
  switchHardware,
} from "@/services/studio";
import type { HardwareDeviceId } from "@/types/wizard";
import type { VariantId } from "@/types/studio";

export function useHwOptions() {
  return useQuery({ queryKey: ["studio", "hwOptions"], queryFn: getHwOptions });
}

export function useLayoutVariants() {
  return useQuery({ queryKey: ["studio", "variants"], queryFn: getLayoutVariants });
}

export function useComplianceChecks() {
  return useQuery({ queryKey: ["studio", "compliance"], queryFn: getComplianceChecks });
}

export function useRendererSpec(hw: HardwareDeviceId) {
  return useQuery({ queryKey: ["studio", "spec", hw], queryFn: () => getRendererSpec(hw) });
}

export function useAssetInfo() {
  return useQuery({ queryKey: ["studio", "asset"], queryFn: getAssetInfo });
}

export function useInitialMessage() {
  return useQuery({ queryKey: ["studio", "initialMsg"], queryFn: getInitialMessage });
}

export function useSelectVariant() {
  return useMutation({ mutationFn: (id: VariantId) => selectVariant(id) });
}

export function useSubmitChatRefine() {
  return useMutation({
    mutationFn: ({ text, hw }: { text: string; hw: HardwareDeviceId }) =>
      submitChatRefine(text, hw),
  });
}

export function useSwitchHardware() {
  return useMutation({ mutationFn: (label: string) => switchHardware(label) });
}
