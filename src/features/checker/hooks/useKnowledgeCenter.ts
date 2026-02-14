import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateComplianceRule,
  cloneRetiredRule,
  createComplianceRule,
  fetchComplianceRules,
  fetchReferenceDocuments,
  fetchRuleVersions,
  retireComplianceRule,
  updateComplianceRule,
  uploadReferenceDocument,
  validateRuleForActivation,
} from "../api/knowledge-center";
import type { CreateRuleInput, RuleFilters, UpdateRuleInput } from "@/types/checker";

export const knowledgeCenterKeys = {
  all: ["checker", "knowledge-center"] as const,
  rules: (filters?: RuleFilters) => [...knowledgeCenterKeys.all, "rules", filters] as const,
  versions: (ruleId?: string) => [...knowledgeCenterKeys.all, "versions", ruleId ?? "all"] as const,
  documents: () => [...knowledgeCenterKeys.all, "documents"] as const,
};

export function useComplianceRules(filters?: RuleFilters) {
  return useQuery({
    queryKey: knowledgeCenterKeys.rules(filters),
    queryFn: () => fetchComplianceRules(filters),
    staleTime: 60 * 1000,
  });
}

export function useRuleVersions(ruleId?: string) {
  return useQuery({
    queryKey: knowledgeCenterKeys.versions(ruleId),
    queryFn: () => fetchRuleVersions(ruleId),
    staleTime: 60 * 1000,
  });
}

export function useReferenceDocuments() {
  return useQuery({
    queryKey: knowledgeCenterKeys.documents(),
    queryFn: fetchReferenceDocuments,
    staleTime: 60 * 1000,
  });
}

export function useValidateRuleActivation() {
  return useMutation({
    mutationFn: (ruleId: string) => validateRuleForActivation(ruleId),
  });
}

function invalidateKnowledgeCenterQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: knowledgeCenterKeys.all });
}

export function useCreateComplianceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRuleInput) => createComplianceRule(payload),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}

export function useUpdateComplianceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, payload }: { ruleId: string; payload: UpdateRuleInput }) =>
      updateComplianceRule(ruleId, payload),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}

export function useActivateComplianceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => activateComplianceRule(ruleId),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}

export function useRetireComplianceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => retireComplianceRule(ruleId),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}

export function useCloneRetiredRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId, createdBy }: { ruleId: string; createdBy: string }) =>
      cloneRetiredRule(ruleId, createdBy),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}

export function useUploadReferenceDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      uploadedBy,
      linkedRuleIds,
    }: {
      name: string;
      uploadedBy: string;
      linkedRuleIds: string[];
    }) => uploadReferenceDocument({ name, uploadedBy, linkedRuleIds }),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}
