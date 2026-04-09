/**
 * usePendingAudits Hook
 * 
 * TanStack Query hook for fetching pending audits in the review queue.
 * 
 * Features:
 * - Automatic caching (1 minute stale time)
 * - Background refetching
 * - Refetch on window focus
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchPendingAudits } from "../api/checker";

/**
 * Query key factory for pending audits
 */
export const pendingAuditsKeys = {
  all: ["checker", "pending-audits"] as const,
  byStore: (storeId: string) => [...pendingAuditsKeys.all, storeId] as const,
};

/**
 * Hook to fetch pending audits for a specific store
 * 
 * @param storeId - The store ID to fetch audits for
 * @returns TanStack Query result with pending audits data
 * 
 * @example
 * ```tsx
 * const { data: audits, isLoading, error } = usePendingAudits(selectedStoreId);
 * ```
 */
export function usePendingAudits(storeId: string) {
  return useQuery({
    queryKey: pendingAuditsKeys.byStore(storeId),
    queryFn: () => fetchPendingAudits(storeId),
    staleTime: 1 * 60 * 1000, // 1 minute - audit queue updates frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}
