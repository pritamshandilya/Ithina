/**
 * usePlanogramList Hook
 *
 * TanStack Query hook for fetching available planograms from third party.
 */
import { useQuery } from "@tanstack/react-query";

import { fetchPlanogramList } from "@/lib/api/maker/planogram";
import type { PlanogramApiStatus } from "@/models/request/planograms";
import { useSelectedStoreId } from "@/providers/store";

export const planogramListKeys = {
  all: ["maker", "planogram-list"] as const,
  byStore: (
    storeId: string | undefined,
    status: PlanogramApiStatus | undefined,
  ) => [...planogramListKeys.all, storeId ?? "all", status ?? "all"] as const,
};

export function usePlanogramList(
  storeId?: string,
  status?: PlanogramApiStatus,
) {
  const selectedStoreId = useSelectedStoreId();
  const scopedStoreId = storeId ?? selectedStoreId;

  return useQuery({
    queryKey: planogramListKeys.byStore(scopedStoreId, status),
    queryFn: () => fetchPlanogramList(status),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
