/**
 * useRuleInfo Hook
 * 
 * TanStack Query hook for fetching rule information and metadata.
 * 
 * Features:
 * - Automatic caching (5 minute stale time)
 * - Background refetching
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchRuleInfo } from "../api/checker";

/**
 * Query key factory for rule info
 */
export const ruleInfoKeys = {
  all: ["checker", "rule-info"] as const,
  byStore: (storeId: string) => [...ruleInfoKeys.all, storeId] as const,
};

/**
 * Hook to fetch rule information for a specific store
 * 
 * @param storeId - The store ID to fetch rule info for
 * @returns TanStack Query result with rule info data
 * 
 * @example
 * ```tsx
 * const { data: ruleInfo, isLoading, error } = useRuleInfo(selectedStoreId);
 * ```
 */
export function useRuleInfo(storeId: string) {
  return useQuery({
    queryKey: ruleInfoKeys.byStore(storeId),
    queryFn: () => fetchRuleInfo(storeId),
    staleTime: 5 * 60 * 1000, // 5 minutes - rules don't change very often
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });
}
