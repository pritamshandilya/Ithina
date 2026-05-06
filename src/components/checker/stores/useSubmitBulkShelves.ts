import { useCallback } from "react";

import type { ParsedBulkPayload } from "./BulkAddShelvesModal";
import { useCreateBulkFixtures } from "@/queries/maker/hooks/useFixtureMutations";

export function useSubmitBulkShelves(selectedStoreId?: string) {
  const bulkCreateMutation = useCreateBulkFixtures();

  return useCallback(
    async (payload: ParsedBulkPayload) => {
      if (!selectedStoreId) return 0;
      const response = await bulkCreateMutation.mutateAsync({
        storeId: selectedStoreId,
        payload: {
          fixtures: payload.fixtures,
        },
      });
      const createdShelves = response.fixtures.reduce(
        (count, fixture) => count + fixture.shelves.length,
        0,
      );
      return createdShelves;
    },
    [bulkCreateMutation, selectedStoreId],
  );
}

