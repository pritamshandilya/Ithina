import { useQuery } from "@tanstack/react-query";

import { listShelves, mapShelfResponseToShelf } from "../api/shelves";

/**
 * Query key factory for assigned shelves
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
 * - Uses real API GET /shelves
 * - Automatic caching (5 minutes default)
 * - Refetch on window focus
 * - Loading and error states
 * - TypeScript type safety with UI-compatible mapping
 * 
 * @returns TanStack Query result with mapped shelves data
 */
export function useAssignedShelves() {
  return useQuery({
    queryKey: assignedShelvesKeys.all,
    queryFn: async () => {
      const responses = await listShelves();
      return responses.map(mapShelfResponseToShelf);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
