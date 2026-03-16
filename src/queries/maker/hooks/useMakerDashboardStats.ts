import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchMakerDashboardStats } from "../api/maker";

export const makerDashboardStatsKeys = {
  all: ["maker", "dashboard-stats"] as const,
  byStore: (storeId: string | undefined) =>
    [...makerDashboardStatsKeys.all, storeId ?? "all"] as const,
};

export function useMakerDashboardStats() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: makerDashboardStatsKeys.byStore(storeId),
    queryFn: () => fetchMakerDashboardStats(storeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
