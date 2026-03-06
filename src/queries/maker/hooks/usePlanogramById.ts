/**
 * usePlanogramById Hook
 *
 * TanStack Query hook for fetching a single planogram by ID from third party.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchPlanogramById } from "../api/planogram";

export const planogramByIdKeys = {
  all: ["maker", "planogram"] as const,
  byId: (id: string | null) => [...planogramByIdKeys.all, id ?? "none"] as const,
};

export function usePlanogramById(id: string | null) {
  return useQuery({
    queryKey: planogramByIdKeys.byId(id),
    queryFn: () => (id ? fetchPlanogramById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
