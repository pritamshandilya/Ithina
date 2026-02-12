/**
 * useAuditDetail Hook
 * 
 * TanStack Query hook for fetching a single audit with detailed information.
 * Used in the review workspace to display full audit details.
 * 
 * Features:
 * - Fetches audit metadata and violations
 * - Automatic caching (5 minute stale time)
 * - Type-safe with TypeScript
 */

import { useQuery } from "@tanstack/react-query";
import { fetchAuditById, fetchAuditViolations } from "../api/checker";

/**
 * Query key factory for audit details
 */
export const auditDetailKeys = {
  all: ["checker", "audit-detail"] as const,
  byId: (auditId: string) => [...auditDetailKeys.all, auditId] as const,
  violations: (auditId: string) => [...auditDetailKeys.byId(auditId), "violations"] as const,
};

/**
 * Hook to fetch a single audit by ID
 * 
 * @param auditId - The audit ID to fetch
 * @returns TanStack Query result with audit data
 * 
 * @example
 * ```tsx
 * const { data: audit, isLoading, error } = useAuditDetail('audit-123');
 * ```
 */
export function useAuditDetail(auditId: string) {
  return useQuery({
    queryKey: auditDetailKeys.byId(auditId),
    queryFn: () => fetchAuditById(auditId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!auditId, // Only fetch if auditId is provided
  });
}

/**
 * Hook to fetch violations for a specific audit
 * 
 * @param auditId - The audit ID to fetch violations for
 * @returns TanStack Query result with violations data
 * 
 * @example
 * ```tsx
 * const { data: violations, isLoading } = useAuditViolations('audit-123');
 * ```
 */
export function useAuditViolations(auditId: string) {
  return useQuery({
    queryKey: auditDetailKeys.violations(auditId),
    queryFn: () => fetchAuditViolations(auditId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!auditId, // Only fetch if auditId is provided
  });
}
