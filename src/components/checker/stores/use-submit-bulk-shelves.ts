import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useCreateFixture, useCreateShelf } from "@/queries/maker";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";
import type { ParsedBulkPayload } from "./bulk-add-shelves-modal";

export function useSubmitBulkShelves(selectedStoreId?: string) {
  const queryClient = useQueryClient();
  const createFixtureMutation = useCreateFixture();
  const createShelfMutation = useCreateShelf();

  return useCallback(
    async (payload: ParsedBulkPayload) => {
      if (!selectedStoreId) return 0;
      let createdShelves = 0;
      for (const fixture of payload.fixtures) {
        const createdFixture = await createFixtureMutation.mutateAsync({
          type: fixture.type,
          dimensions: fixture.dimensions,
          dimension_unit: fixture.dimension_unit,
          physical_location: fixture.physical_location,
        });
        for (const shelf of fixture.shelves) {
          await createShelfMutation.mutateAsync({
            code: shelf.code,
            name: shelf.name,
            fixture_id: createdFixture.id,
            width: shelf.width,
            height: shelf.height,
            vertical_position: shelf.vertical_position,
          });
          createdShelves += 1;
        }
      }
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
    [createFixtureMutation, createShelfMutation, queryClient, selectedStoreId],
  );
}
