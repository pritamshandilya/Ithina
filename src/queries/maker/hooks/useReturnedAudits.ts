/**
 * React Query hook for fetching returned audits
 */

import { useQuery } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchReturnedAudits } from "../api/maker";

/**
 * Query key factory for returned audits
 */
export const returnedAuditsKeys = {
  all: ["maker", "returned-audits"] as const,
  byStore: (storeId: string | undefined) =>
    [...returnedAuditsKeys.all, storeId ?? "all"] as const,
};

/**
 * Hook to fetch returned audits that need resubmission
 * 
 * Features:
 * - Automatic caching (3 minutes)
 * - Refetch on window focus
 * - Loading and error states
 * - Returns empty array if no returned audits
 * 
 * @returns TanStack Query result with returned audits data
 * 
 * @example
 * ```tsx
 * function ReturnedAuditsSection() {
 *   const { data: returnedAudits = [], isLoading } = useReturnedAudits();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (returnedAudits.length === 0) return null; // Don't show section
 *   
 *   return (
 *     <AlertSection variant="warning">
 *       {returnedAudits.map(audit => (
 *         <ReturnedAuditItem key={audit.id} audit={audit} />
 *       ))}
 *     </AlertSection>
 *   );
 * }
 * ```
 */
export function useReturnedAudits() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: returnedAuditsKeys.byStore(storeId),
    queryFn: () => fetchReturnedAudits(storeId),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}
