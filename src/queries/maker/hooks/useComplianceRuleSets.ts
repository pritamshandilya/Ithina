/**
 * useComplianceRuleSets Hook
 *
 * Fetches compliance rule sets for adhoc analysis selection.
 * Rule sets are created in Store Settings (admin / maker).
 */

import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchComplianceRuleSetsForAnalysis } from "@/queries/maker/api/compliance-rule-sets";

export const complianceRuleSetsKeys = {
  all: ["compliance-rule-sets"] as const,
  byStore: (storeId: string | undefined) =>
    [...complianceRuleSetsKeys.all, storeId ?? "all"] as const,
};

export function useComplianceRuleSets() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: complianceRuleSetsKeys.byStore(storeId),
    queryFn: fetchComplianceRuleSetsForAnalysis,
    staleTime: 2 * 60 * 1000,
  });
}
