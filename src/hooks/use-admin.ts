import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addComplianceRule,
  getAdminTabs,
  getBrandTone,
  getComplianceRules,
  getEmptyRuleTemplate,
  getGlobalDisplayRules,
  getHwPalettes,
  getLcdRules,
  saveProfileJson,
} from "@/services/admin";

export const adminKeys = {
  all: ["admin"] as const,
  palettes: ["admin", "palettes"] as const,
  lcdRules: ["admin", "lcdRules"] as const,
  compliance: ["admin", "compliance"] as const,
  tone: ["admin", "tone"] as const,
  globalRules: ["admin", "globalRules"] as const,
  tabs: ["admin", "tabs"] as const,
  emptyRule: ["admin", "emptyRule"] as const,
};

export function useAdminTabs() {
  return useQuery({
    queryKey: adminKeys.tabs,
    queryFn: getAdminTabs,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useEmptyRuleTemplate() {
  return useQuery({
    queryKey: adminKeys.emptyRule,
    queryFn: getEmptyRuleTemplate,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useHwPalettes() {
  return useQuery({
    queryKey: adminKeys.palettes,
    queryFn: getHwPalettes,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useLcdRules() {
  return useQuery({
    queryKey: adminKeys.lcdRules,
    queryFn: getLcdRules,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useComplianceRulesQuery() {
  return useQuery({
    queryKey: adminKeys.compliance,
    queryFn: getComplianceRules,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useBrandTone() {
  return useQuery({
    queryKey: adminKeys.tone,
    queryFn: getBrandTone,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useGlobalDisplayRules() {
  return useQuery({
    queryKey: adminKeys.globalRules,
    queryFn: getGlobalDisplayRules,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useAddComplianceRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addComplianceRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.compliance });
    },
  });
}

export function useSaveProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveProfileJson,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}
