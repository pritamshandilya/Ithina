import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient for the app so auth/session code can clear caches on logout.
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
