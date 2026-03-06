/**
 * useStores Hook
 *
 * TanStack Query hook for fetching stores assigned to the maker.
 * Uses real /stores API endpoint — Bearer token identifies the user.
 */
import { useQuery } from "@tanstack/react-query";

import { fetchStores } from "../api/maker";
import { AuthSessionService } from "@/lib/auth/session";

export const storesKeys = {
  all: ["maker", "stores"] as const,
  byUser: (userId: string) => [...storesKeys.all, userId] as const,
};

export function useStores() {
  const currentUser = AuthSessionService.getCurrentUser();
  const userId = currentUser?.id ?? "anonymous";

  return useQuery({
    queryKey: storesKeys.byUser(userId),
    queryFn: () => fetchStores(userId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!currentUser,
  });
}
