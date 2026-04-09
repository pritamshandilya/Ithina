/**
 * useUpdateShelf Hook
 *
 * TanStack Query mutation for updating a shelf via PUT /shelves/{id}.
 * Invalidates both the list and the specific detail cache on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateShelf } from "../api/shelves";
import type { UpdateShelfPayload } from "@/models/request/shelves";

export function useUpdateShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shelfId,
      payload,
    }: {
      shelfId: string;
      payload: UpdateShelfPayload;
    }) => updateShelf(shelfId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["maker", "shelves", "list"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["maker", "shelves", "detail"],
      });
    },
  });
}
