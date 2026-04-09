/**
 * usePlanogramShelfPreview Hook
 *
 * Fetches shelf and planogram payload for the planogram preview view.
 * Returns null if shelf has no planogramId.
 */

import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { getShelfById } from "../api/maker";
import { fetchPlanogramById } from "../api/planogram";

export const planogramShelfPreviewKeys = {
  all: ["maker", "planogram-shelf-preview"] as const,
  byShelfId: (storeId: string | undefined, shelfId: string | null) =>
    [...planogramShelfPreviewKeys.all, storeId ?? "all", shelfId ?? "none"] as const,
};

export interface PlanogramShelfPreview {
  shelf: NonNullable<Awaited<ReturnType<typeof getShelfById>>>;
  planogramPayload: Awaited<ReturnType<typeof fetchPlanogramById>>;
}

export function usePlanogramShelfPreview(shelfId: string | null) {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: planogramShelfPreviewKeys.byShelfId(storeId, shelfId),
    queryFn: async (): Promise<PlanogramShelfPreview | null> => {
      if (!shelfId) return null;
      const shelf = await getShelfById(shelfId);
      if (!shelf) return null;
      if (!shelf.planogramId) return { shelf, planogramPayload: null };
      const planogramPayload = await fetchPlanogramById(shelf.planogramId);
      if (!planogramPayload) return { shelf, planogramPayload: null };
      return { shelf, planogramPayload };
    },
    enabled: !!shelfId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
