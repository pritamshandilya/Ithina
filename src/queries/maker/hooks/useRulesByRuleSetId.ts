/**
 * useRulesByRuleSetId Hook
 *
 * Fetches rules in a compliance rule set (read-only view for maker).
 */

import { useQuery } from "@tanstack/react-query";
import { fetchRulesByRuleSetId } from "@/queries/checker/api/knowledge-center";

export const rulesByRuleSetIdKeys = {
  all: ["rules-by-rule-set"] as const,
  byId: (ruleSetId: string | null) =>
    [...rulesByRuleSetIdKeys.all, ruleSetId] as const,
};

export function useRulesByRuleSetId(ruleSetId: string | null) {
  return useQuery({
    queryKey: rulesByRuleSetIdKeys.byId(ruleSetId),
    queryFn: () => fetchRulesByRuleSetId(ruleSetId!),
    enabled: !!ruleSetId,
    staleTime: 2 * 60 * 1000,
  });
}
