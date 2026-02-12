/**
 * usePublishedAudits Hook
 * 
 * TanStack Query hook for fetching recently published audits.
 * 
 * Features:
 * - Automatic caching (1 minute stale time)
 * - Background refetching
 * - Refetch on window focus
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchPublishedAudits } from "../api/checker";

/**
 * Query key factory for published audits
 */
export const publishedAuditsKeys = {
  all: ["checker", "published-audits"] as const,
  byStore: (storeId: string) => [...publishedAuditsKeys.all, storeId] as const,
};

/**
 * Hook to fetch recently published audits for a specific store
 * 
 * @param storeId - The store ID to fetch published audits for
 * @returns TanStack Query result with published audits data
 * 
 * @example
 * ```tsx
 * const { data: publishedAudits, isLoading, error } = usePublishedAudits(selectedStoreId);
 * ```
 */
export function usePublishedAudits(storeId: string) {
  return useQuery({
    queryKey: publishedAuditsKeys.byStore(storeId),
    queryFn: () => fetchPublishedAudits(storeId),
    staleTime: 1 * 60 * 1000, // 1 minute - publishing status updates frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    refetchOnWindowFocus: true,
  });
}
