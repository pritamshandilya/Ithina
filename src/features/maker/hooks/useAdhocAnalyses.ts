/**
 * useAdhocAnalyses Hook
 *
 * TanStack Query hook for fetching adhoc analyses (one-off shelf image uploads + AI analysis).
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAdhocAnalyses } from "../api/maker";

export const adhocAnalysesKeys = {
  all: ["maker", "adhoc-analyses"] as const,
  byStore: (storeId: string | undefined) => [...adhocAnalysesKeys.all, storeId ?? "all"] as const,
};

export function useAdhocAnalyses(storeId?: string) {
  return useQuery({
    queryKey: adhocAnalysesKeys.byStore(storeId),
    queryFn: () => fetchAdhocAnalyses(storeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
