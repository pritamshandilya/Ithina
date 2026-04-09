import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  activateComplianceRule,
  cloneRetiredRule,
  createComplianceRule,
  fetchComplianceRules,
  fetchReferenceDocuments,
  retireComplianceRule,
  updateComplianceRule,
  updateReferenceDocumentLinks,
  uploadReferenceDocument,
  validateRuleForActivation,
} from "../api/knowledge-center";
import type { CreateRuleInput, RuleFilters, UpdateRuleInput } from "@/types/checker";
import { useSelectedStoreId } from "@/providers/store";

export const knowledgeCenterKeys = {
  all: ["checker", "knowledge-center"] as const,
  rules: (filters?: RuleFilters) => [...knowledgeCenterKeys.all, "rules", filters] as const,
  documents: () => [...knowledgeCenterKeys.all, "documents"] as const,
};

export function useComplianceRules(filters?: RuleFilters) {
  const storeId = useSelectedStoreId();
  return useQuery({
    queryKey: [...knowledgeCenterKeys.rules(filters), storeId ?? "none"] as const,
    queryFn: () => fetchComplianceRules(filters),
    staleTime: 60 * 1000,
  });
}

/** Versions are derived from the same compliance-rules query (one network fetch). */
export function useRuleVersions(ruleId?: string) {
  const rulesQuery = useComplianceRules();
  const data = useMemo(() => {
    const rules = rulesQuery.data ?? [];
    const all = rules.flatMap((r) => r.versions);
    const filtered = ruleId ? all.filter((v) => v.ruleId === ruleId) : all;
    return [...filtered].sort((a, b) => b.createdDate.getTime() - a.createdDate.getTime());
  }, [rulesQuery.data, ruleId]);

  return {
    ...rulesQuery,
    data,
  };
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

export function useUpdateReferenceDocumentLinks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, linkedRuleIds }: { documentId: string; linkedRuleIds: string[] }) =>
      updateReferenceDocumentLinks(documentId, linkedRuleIds),
    onSuccess: () => invalidateKnowledgeCenterQueries(queryClient),
  });
}
