/**
 * useOverrideActivity Hook
 * 
 * TanStack Query hook for fetching override activity metrics.
 * 
 * Features:
 * - Automatic caching (2 minute stale time)
 * - Background refetching
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchOverrideActivity } from "../api/checker";

/**
 * Query key factory for override activity
 */
export const overrideActivityKeys = {
  all: ["checker", "override-activity"] as const,
  byStore: (storeId: string) => [...overrideActivityKeys.all, storeId] as const,
};

/**
 * Hook to fetch override activity metrics for a specific store
 * 
 * @param storeId - The store ID to fetch override data for
 * @returns TanStack Query result with override activity data
 * 
 * @example
 * ```tsx
 * const { data: overrides, isLoading, error } = useOverrideActivity(selectedStoreId);
 * ```
 */
export function useOverrideActivity(storeId: string) {
  return useQuery({
    queryKey: overrideActivityKeys.byStore(storeId),
    queryFn: () => fetchOverrideActivity(storeId),
    staleTime: 2 * 60 * 1000, // 2 minutes - overrides update moderately
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    refetchOnWindowFocus: true,
  });
}
