/**
 * useShelves / useShelf Hooks
 *
 * TanStack Query hooks for fetching shelves from the real API.
 *
 *  - useShelves(fixtureId?)  → GET /shelves (optionally filtered by fixture)
 *  - useShelf(shelfId)       → GET /shelves/{id}
 */

import { useQuery } from "@tanstack/react-query";

import { getShelf, listShelves, mapShelfResponseToShelf } from "../api/shelves";
import { shelfKeys } from "@/queries/shared";

/**
 * Fetch all shelves for the current store.
 *
 * @param fixtureId - Optional fixture UUID to filter results
 */
export function useShelves(fixtureId?: string) {
  return useQuery({
    queryKey: shelfKeys.list(fixtureId ? { fixture_id: fixtureId } : undefined),
    queryFn: async () => {
      const responses = await listShelves(fixtureId);
      return responses.map(mapShelfResponseToShelf);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch a single shelf by its UUID.
 *
 * @param shelfId - The shelf UUID (query is disabled when falsy)
 */
export function useShelf(shelfId: string | undefined) {
  return useQuery({
    queryKey: shelfKeys.detail(shelfId ?? ""),
    queryFn: async () => {
      const response = await getShelf(shelfId!);
      return mapShelfResponseToShelf(response);
    },
    enabled: !!shelfId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
