import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createStoreFixturesBulk } from "@/queries/checker/api/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import type { ParsedBulkPayload } from "./bulk-add-shelves-modal";

export function useSubmitBulkShelves(selectedStoreId?: string) {
  const queryClient = useQueryClient();

  return useCallback(
    async (payload: ParsedBulkPayload) => {
      if (!selectedStoreId) return 0;
      const response = await createStoreFixturesBulk(selectedStoreId, {
        fixtures: payload.fixtures,
      });
      const createdShelves = response.fixtures.reduce(
        (count, fixture) => count + fixture.shelves.length,
        0,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(selectedStoreId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", selectedStoreId],
        }),
      ]);
      return createdShelves;
    },
    [queryClient, selectedStoreId],
  );
}
