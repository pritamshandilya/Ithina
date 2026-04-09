import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { getShelf, listShelves, mapShelfResponseToShelf } from "../api/shelves";

/**
 * Fetch all shelves for the current store.
 *
 * @param fixtureId - Optional fixture UUID to filter results
 */
export function useShelves(fixtureId?: string) {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: ["maker", "shelves", "list", storeId ?? "all", fixtureId ?? "all"],
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
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: ["maker", "shelves", "detail", storeId ?? "all", shelfId ?? "none"],
    queryFn: async () => {
      const response = await getShelf(shelfId!);
      return mapShelfResponseToShelf(response);
    },
    enabled: !!shelfId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
