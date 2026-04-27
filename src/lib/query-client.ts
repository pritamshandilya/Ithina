import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient for the app so auth/session code can clear caches on logout.
 *
 * Store-scoped data uses query keys that include the active store id (see
 * `useCampaignList`, `useInboxItems`, `useFleetStats`, etc.), so switching
 * stores does not reuse another store's cache and in-flight responses cannot
 * overwrite the wrong scope.
 */
export const promoQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
