import { useQuery } from "@tanstack/react-query";
import { fetchCheckerDashboardStats } from "../api/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { useStore } from "@/providers/store";

export const checkerDashboardStatsKeys = {
  all: ["checker", "dashboard-stats"] as const,
  byStore: (storeId: string) =>
    [...checkerDashboardStatsKeys.all, storeId] as const,
};

export function useCheckerDashboardStats() {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockCheckerUser.storeId;

  return useQuery({
    queryKey: checkerDashboardStatsKeys.byStore(storeId),
    queryFn: () => fetchCheckerDashboardStats(storeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
