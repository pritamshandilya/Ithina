/**
 * usePlanogramById Hook
 *
 * TanStack Query hook for fetching a single planogram by ID from third party.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchPlanogramById } from "../api/planogram";

/**
 * Query key factory for individual planograms
 *
 * Colocated with the hook that uses it so planogram-specific invalidation
 * logic remains near the data-fetching logic.
 */
export const planogramKeys = {
  all: ["planograms"] as const,
  detail: (id: string) => [...planogramKeys.all, "detail", id] as const,
} as const;

export function usePlanogramById(id: string | null) {
  return useQuery({
    queryKey: planogramKeys.detail(id ?? "none"),
    queryFn: () => (id ? fetchPlanogramById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
