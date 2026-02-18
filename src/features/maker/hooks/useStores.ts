/**
 * useStores Hook
 *
 * TanStack Query hook for fetching stores assigned to the maker.
 * Makers can belong to more than one store.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchStores } from "../api/maker";
import { mockUser } from "@/lib/api/mock-data";

export const storesKeys = {
  all: ["maker", "stores"] as const,
  byUser: (userId: string) => [...storesKeys.all, userId] as const,
};

export function useStores() {
  return useQuery({
    queryKey: storesKeys.byUser(mockUser.id),
    queryFn: () => fetchStores(mockUser.id),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
