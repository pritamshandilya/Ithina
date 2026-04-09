import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createComplianceRuleSet,
  type CreateComplianceRuleSetInput,
} from "@/queries/maker/api/compliance-rule-sets";

import { complianceRuleSetsKeys } from "./useComplianceRuleSets";

export function useCreateComplianceRuleSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateComplianceRuleSetInput) =>
      createComplianceRuleSet(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: complianceRuleSetsKeys.all });
    },
  });
}

