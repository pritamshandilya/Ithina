/**
 * useAuditActions Hooks
 *
 * TanStack Query mutation hooks for audit actions (approve, return, override).
 *
 * Features:
 * - Automatic cache invalidation after mutations
 * - Optimistic updates for better UX
 * - Type-safe with TypeScript
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveAudit,
  deleteAudit,
  overrideAndApprove,
  returnAudit,
} from "../api/checker";
import { complianceOverviewKeys } from "./useComplianceOverview";
import { overrideActivityKeys } from "./useOverrideActivity";
import { pendingAuditsKeys } from "./usePendingAudits";
import { publishedAuditsKeys } from "./usePublishedAudits";

/**
 * Hook to approve an audit
 *
 * @param storeId - The store ID for cache invalidation
 * @returns Mutation function to approve an audit
 *
 * @example
 * ```tsx
 * const approveAuditMutation = useApproveAudit(selectedStoreId);
 * approveAuditMutation.mutate('audit-123');
 * ```
 */
export function useApproveAudit(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveAudit,
    onSuccess: () => {
      // Invalidate relevant queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: pendingAuditsKeys.byStore(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: complianceOverviewKeys.detail(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: publishedAuditsKeys.byStore(storeId),
      });
    },
  });
}

/**
 * Hook to return an audit to the maker
 *
 * @param storeId - The store ID for cache invalidation
 * @returns Mutation function to return an audit
 *
 * @example
 * ```tsx
 * const returnAuditMutation = useReturnAudit(selectedStoreId);
 * returnAuditMutation.mutate({ auditId: 'audit-123', reason: 'Incomplete data' });
 * ```
 */
export function useReturnAudit(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auditId, reason }: { auditId: string; reason: string }) =>
      returnAudit(auditId, reason),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: pendingAuditsKeys.byStore(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: complianceOverviewKeys.detail(storeId),
      });
    },
  });
}

/**
 * Hook to override AI decision and approve audit
 *
 * @param storeId - The store ID for cache invalidation
 * @returns Mutation function to override and approve
 *
 * @example
 * ```tsx
 * const overrideMutation = useOverrideAndApprove(selectedStoreId);
 * overrideMutation.mutate({ auditId: 'audit-123', overrideReason: 'Valid business exception' });
 * ```
 */
export function useOverrideAndApprove(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      auditId,
      overrideReason,
    }: {
      auditId: string;
      overrideReason: string;
    }) => overrideAndApprove(auditId, overrideReason),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: pendingAuditsKeys.byStore(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: complianceOverviewKeys.detail(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: publishedAuditsKeys.byStore(storeId),
      });
      queryClient.invalidateQueries({
        queryKey: overrideActivityKeys.byStore(storeId),
      });
    },
  });
}

/**
 * Hook to delete/cancel an audit
 *
 * @param storeId - The store ID for cache invalidation
 * @returns Mutation function to delete an audit
 */
export function useDeleteAudit(storeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAudit,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: pendingAuditsKeys.byStore(storeId),
      });
    },
  });
}
