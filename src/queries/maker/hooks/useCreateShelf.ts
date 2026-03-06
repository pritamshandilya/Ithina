/**
 * React Query hook for creating a new shelf
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createShelf } from "../api/maker";
import { assignedShelvesKeys } from "./useAssignedShelves";

/**
 * Hook to create a new shelf
 * 
 * Features:
 * - Mutation for creating shelf
 * - Invalidation of assigned shelves list on success
 * - Loading and error states
 * 
 * @returns TanStack Mutation result
 */
export function useCreateShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShelf,
    onSuccess: () => {
      // Invalidate the shelves list to show the new shelf
      void queryClient.invalidateQueries({ queryKey: assignedShelvesKeys.all });
    },
  });
}
