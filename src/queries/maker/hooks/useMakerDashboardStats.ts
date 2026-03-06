import { useQuery } from "@tanstack/react-query";

import { fetchMakerDashboardStats } from "../api/maker";

export const makerDashboardStatsKeys = {
  all: ["maker", "dashboard-stats"] as const,
};

export function useMakerDashboardStats() {
  return useQuery({
    queryKey: makerDashboardStatsKeys.all,
    queryFn: fetchMakerDashboardStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
