/**
 * React Query hook for fetching quick statistics
 */

import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchQuickStats } from "../api/maker";

/**
 * Query key factory for quick stats
 */
export const quickStatsKeys = {
  all: ["maker", "quick-stats"] as const,
  byStore: (storeId: string | undefined) =>
    [...quickStatsKeys.all, storeId ?? "all"] as const,
};

/**
 * Hook to fetch quick statistics for the dashboard
 * 
 * Features:
 * - Automatic caching (2 minutes for fresher data)
 * - Refetch on window focus (important for real-time feel)
 * - Auto-refetch every 2 minutes for live updates
 * - Loading and error states
 * 
 * @returns TanStack Query result with stats data
 * 
 * @example
 * ```tsx
 * function QuickStatsPanel() {
 *   const { data: stats, isLoading } = useQuickStats();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   return (
 *     <>
 *       <StatCard title="Today" value={stats?.auditsSubmittedToday} />
 *       <StatCard title="Pending" value={stats?.pendingReviewCount} />
 *       <StatCard title="Returned" value={stats?.returnedAuditsCount} />
 *     </>
 *   );
 * }
 * ```
 */
export function useQuickStats() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: quickStatsKeys.byStore(storeId),
    queryFn: () => fetchQuickStats(storeId),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for stats)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}
