/**
 * useStores Hook
 * 
 * TanStack Query hook for fetching stores assigned to the checker.
 * 
 * Features:
 * - Automatic caching (10 minute stale time)
 * - Background refetching
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "../api/checker";
import { mockCheckerUser } from "@/lib/api/mock-data";

/**
 * Query key factory for stores
 */
export const storesKeys = {
  all: ["checker", "stores"] as const,
  byUser: (userId: string) => [...storesKeys.all, userId] as const,
};

/**
 * Hook to fetch stores assigned to the checker
 * 
 * @returns TanStack Query result with stores data
 * 
 * @example
 * ```tsx
 * const { data: stores, isLoading, error } = useStores();
 * ```
 */
export function useStores() {
  return useQuery({
    queryKey: storesKeys.byUser(mockCheckerUser.id),
    queryFn: () => fetchStores(mockCheckerUser.id),
    staleTime: 10 * 60 * 1000, // 10 minutes - stores don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });
}
