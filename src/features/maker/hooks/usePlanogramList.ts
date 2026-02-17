/**
 * usePlanogramList Hook
 *
 * TanStack Query hook for fetching available planograms from third party.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchPlanogramList } from "../api/planogram";

export const planogramListKeys = {
  all: ["maker", "planogram-list"] as const,
  byStore: (storeId: string | undefined) => [...planogramListKeys.all, storeId ?? "all"] as const,
};

export function usePlanogramList(storeId?: string) {
  return useQuery({
    queryKey: planogramListKeys.byStore(storeId),
    queryFn: () => fetchPlanogramList(storeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
