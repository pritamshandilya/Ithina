/**
 * useDraftAudits Hook
 * 
 * TanStack Query hook for fetching and managing draft audits.
 * 
 * Features:
 * - Automatic caching (1 minute stale time)
 * - Background refetching
 * - Type-safe with TypeScript
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useSelectedStoreId } from "@/providers/store";
import { fetchDraftAudits, saveDraftProgress, deleteDraft } from "../api/maker";
import { quickStatsKeys } from "./useQuickStats";
import type { Audit } from "@/types/maker";

/**
 * Query key factory for draft audits
 */
export const draftAuditsKeys = {
  all: ["maker", "draft-audits"] as const,
  byStore: (storeId: string | undefined) =>
    [...draftAuditsKeys.all, storeId ?? "all"] as const,
};

/**
 * Hook to fetch all draft audits
 * 
 * @returns TanStack Query result with draft audits data
 * 
 * @example
 * ```tsx
 * const { data: drafts, isLoading } = useDraftAudits();
 * ```
 */
export function useDraftAudits() {
  const storeId = useSelectedStoreId();

  return useQuery({
    queryKey: draftAuditsKeys.byStore(storeId),
    queryFn: () => fetchDraftAudits(storeId),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to save draft progress
 * 
 * @returns Mutation function to save draft
 * 
 * @example
 * ```tsx
 * const saveDraft = useSaveDraftProgress();
 * saveDraft.mutate({ auditId: 'audit-123', progress: 65 });
 * ```
 */
export function useSaveDraftProgress() {
  const queryClient = useQueryClient();
  const storeId = useSelectedStoreId();

  return useMutation({
    mutationFn: ({ auditId, progress }: { auditId: string; progress: number }) =>
      saveDraftProgress(auditId, progress),
    // Optimistic update
    onMutate: async ({ auditId, progress }) => {
      await queryClient.cancelQueries({ queryKey: draftAuditsKeys.byStore(storeId) });

      const previousDrafts = queryClient.getQueryData(
        draftAuditsKeys.byStore(storeId),
      );

      queryClient.setQueryData<Audit[]>(
        draftAuditsKeys.byStore(storeId),
        (old) =>
        old?.map((audit) =>
          audit.id === auditId
            ? { ...audit, draftProgress: progress, draftSavedAt: new Date() }
            : audit
        ),
      );

      return { previousDrafts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDrafts) {
        queryClient.setQueryData(
          draftAuditsKeys.byStore(storeId),
          context.previousDrafts,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: draftAuditsKeys.byStore(storeId) });
      queryClient.invalidateQueries({ queryKey: ["maker", "assigned-shelves"] });
    },
  });
}

/**
 * Hook to delete a draft
 * 
 * @returns Mutation function to delete draft
 * 
 * @example
 * ```tsx
 * const deleteDraftMutation = useDeleteDraft();
 * deleteDraftMutation.mutate('audit-123');
 * ```
 */
export function useDeleteDraft() {
  const queryClient = useQueryClient();
  const storeId = useSelectedStoreId();

  return useMutation({
    mutationFn: deleteDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: draftAuditsKeys.byStore(storeId) });
      queryClient.invalidateQueries({ queryKey: ["maker", "assigned-shelves"] });
      queryClient.invalidateQueries({ queryKey: quickStatsKeys.all });
    },
  });
}
