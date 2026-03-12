/**
 * useDeleteShelf Hook
 *
 * TanStack Query mutation for deleting a shelf via DELETE /shelves/{id}.
 * Removes the detail cache entry and invalidates the list on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShelf } from "../api/shelves";
import { shelfKeys } from "@/queries/shared";

export function useDeleteShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shelfId: string) => deleteShelf(shelfId),
    onSuccess: (_data, shelfId) => {
      queryClient.removeQueries({ queryKey: shelfKeys.detail(shelfId) });
      void queryClient.invalidateQueries({ queryKey: shelfKeys.lists() });
    },
  });
}
