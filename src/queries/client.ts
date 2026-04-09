/**
 * TanStack Query Client
 *
 * Centralized QueryClient instance for the application.
 * Configure globally consistent defaults here:
 *  - staleTime: how long data is considered fresh
 *  - gcTime: how long unused cache entries live
 *  - retry: smart retry logic (no retry on 4xx, retry 3× on 5xx / network)
 *  - refetchOnWindowFocus: disabled during development to reduce noise
 */
import { QueryClient } from "@tanstack/react-query";

/**
 * Determines whether a failed query should be retried.
 * - Never retry on 4xx client errors (bad request, not found, unauthorized, etc.)
 * - Retry up to 3 times on 5xx server errors or network failures.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;

  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    // Do not retry on client errors
    if (status >= 400 && status < 500) return false;
  }

  return true;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes – data is fresh for 5 min
      gcTime: 10 * 60 * 1000, // 10 minutes – cache entry lives 10 min after last use
      retry: shouldRetry,
      refetchOnWindowFocus: false, // Set to true in production if real-time freshness matters
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false, // Never auto-retry mutations
    },
  },
});
