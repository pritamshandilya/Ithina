/**
 * useCreateShelf Hook
 *
 * TanStack Query mutation for creating a new shelf via POST /shelves.
 * Invalidates the shelf list on success so the UI stays in sync.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createShelf } from "../api/shelves";

export function useCreateShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShelf,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["maker", "shelves", "list"],
      });
    },
  });
}
