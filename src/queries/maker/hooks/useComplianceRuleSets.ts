/**
 * useComplianceRuleSets Hook
 *
 * Fetches compliance rule sets for adhoc analysis selection.
 * Rule sets are created in the Checker's Knowledge Center.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchComplianceRuleSetsForAnalysis } from "@/queries/checker/api/knowledge-center";

export const complianceRuleSetsKeys = {
  all: ["compliance-rule-sets"] as const,
};

export function useComplianceRuleSets() {
  return useQuery({
    queryKey: complianceRuleSetsKeys.all,
    queryFn: fetchComplianceRuleSetsForAnalysis,
    staleTime: 2 * 60 * 1000,
  });
}
