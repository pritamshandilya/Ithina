/**
 * React Query hook for fetching assigned shelves
 */

import { useQuery } from "@tanstack/react-query";

import { fetchAssignedShelves } from "../api/maker";

/**
 * Query key factory for assigned shelves
 * Centralizes query key management for better cache control
 */
export const assignedShelvesKeys = {
  all: ["maker", "assigned-shelves"] as const,
  lists: () => [...assignedShelvesKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...assignedShelvesKeys.lists(), { filters }] as const,
};

/**
 * Hook to fetch assigned shelves for the current user
 * 
 * Features:
 * - Automatic caching (5 minutes default)
 * - Refetch on window focus
 * - Loading and error states
 * - TypeScript type safety
 * 
 * @returns TanStack Query result with shelves data
 * 
 * @example
 * ```tsx
 * function ShelfList() {
 *   const { data: shelves, isLoading, error } = useAssignedShelves();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error loading shelves</div>;
 *   
 *   return (
 *     <div>
 *       {shelves?.map(shelf => (
 *         <ShelfCard key={shelf.id} shelf={shelf} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAssignedShelves() {
  return useQuery({
    queryKey: assignedShelvesKeys.all,
    queryFn: fetchAssignedShelves,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
