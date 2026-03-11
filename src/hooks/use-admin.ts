import { useMutation, useQuery } from "@tanstack/react-query";

import {
  addComplianceRule,
  getBrandTone,
  getComplianceRules,
  getGlobalDisplayRules,
  getHwPalettes,
  getLcdRules,
  saveProfileJson,
} from "@/services/admin";

export function useHwPalettes() {
  return useQuery({ queryKey: ["admin", "palettes"], queryFn: getHwPalettes });
}

export function useLcdRules() {
  return useQuery({ queryKey: ["admin", "lcdRules"], queryFn: getLcdRules });
}

export function useComplianceRulesQuery() {
  return useQuery({ queryKey: ["admin", "compliance"], queryFn: getComplianceRules });
}

export function useBrandTone() {
  return useQuery({ queryKey: ["admin", "tone"], queryFn: getBrandTone });
}

export function useGlobalDisplayRules() {
  return useQuery({ queryKey: ["admin", "globalRules"], queryFn: getGlobalDisplayRules });
}

export function useAddComplianceRule() {
  return useMutation({ mutationFn: addComplianceRule });
}

export function useSaveProfile() {
  return useMutation({ mutationFn: saveProfileJson });
}
