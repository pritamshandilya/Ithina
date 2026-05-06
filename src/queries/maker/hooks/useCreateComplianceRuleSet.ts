import { useMutation, useQueryClient } from "@tanstack/react-query";

import { complianceRuleSetsKeys } from "./useComplianceRuleSets";
import {
  type CreateComplianceRuleSetInput,
  createComplianceRuleSet,
} from "@/lib/api/maker/complianceRuleSets";

export function useCreateComplianceRuleSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateComplianceRuleSetInput) =>
      createComplianceRuleSet(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: complianceRuleSetsKeys.all,
      });
    },
  });
}
