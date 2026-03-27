/**
 * useDeleteShelf Hook
 *
 * TanStack Query mutation for deleting a shelf via DELETE /shelves/{id}.
 * Removes the detail cache entry and invalidates the list on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShelf } from "../api/shelves";

export function useDeleteShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shelfId: string) => deleteShelf(shelfId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: ["maker", "shelves", "detail"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["maker", "shelves", "list"],
      });
    },
  });
}
