/**
 * useComplianceOverview Hook
 *
 * TanStack Query hook for fetching compliance overview metrics.
 *
 * Features:
 * - Automatic caching (30 second stale time)
 * - Auto-refresh every 30 seconds
 * - Refetch on window focus
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchComplianceOverview } from "../api/checker";

/**
 * Query key factory for compliance overview
 */
export const complianceOverviewKeys = {
  all: ["compliance-overview"] as const,
  detail: (storeId: string) =>
    [...complianceOverviewKeys.all, "detail", storeId] as const,
} as const;

/**
 * Hook to fetch compliance overview metrics for a specific store
 * 
 * @param storeId - The store ID to fetch metrics for
 * @returns TanStack Query result with compliance overview data
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useComplianceOverview(selectedStoreId);
 * ```
 */
export function useComplianceOverview(storeId: string) {
  return useQuery({
    queryKey: complianceOverviewKeys.detail(storeId),
    queryFn: () => fetchComplianceOverview(storeId),
    staleTime: 30 * 1000, // 30 seconds - governance metrics update frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}
