/**
 * usePlanogramList Hook
 *
 * TanStack Query hook for fetching available planograms from third party.
 */

import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchPlanogramList } from "../api/planogram";

export const planogramListKeys = {
  all: ["maker", "planogram-list"] as const,
  byStore: (storeId: string | undefined) => [...planogramListKeys.all, storeId ?? "all"] as const,
};

export function usePlanogramList(storeId?: string) {
  const selectedStoreId = useSelectedStoreId();
  const scopedStoreId = storeId ?? selectedStoreId;

  return useQuery({
    queryKey: planogramListKeys.byStore(scopedStoreId),
    queryFn: () => fetchPlanogramList(scopedStoreId),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
