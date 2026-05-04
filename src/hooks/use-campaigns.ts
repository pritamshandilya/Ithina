import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useMemo } from "react";

import {
  extractVariantsFromEvents,
  getScheduledPreviewImageUrl,
  getSubmittedVariantId,
} from "@/features/campaign-studio/types";

import { useActiveStoreId } from "@/hooks/use-active-store-id";
import { useCampaignEvents } from "@/hooks/use-campaign-events";

import { toast } from "@/hooks/use-toast";
import {
  approveCampaign,
  chatCampaign,
  createCampaign,
  deleteCampaign,
  draftCampaignFromPrompt,
  generateCampaign,
  getCalendarWeekdays,
  getCampaign,
  getCampaignFilters,
  getCampaignList,
  getCampaignStatDefinitions,
  getCampaignStatusStyles,
  getCampaignTableColumns,
  getCampaignTimeline,
  getMonthNames,
  postCampaignChat,
  rejectCampaign,
  enterGuardrailsReview,
  patchCampaign,
  submitCampaign,
  updateCampaign,
  validateCampaignGuardrails,
} from "@/services/campaigns";
import type { CampaignCreateForm } from "@/types/campaigns";
import type {
  ApiCampaignApproveRequest,
  ApiCampaignChatMessageRequest,
  ApiCampaignChatRequest,
  ApiCampaignDraftRequest,
  ApiCampaignGenerateRequest,
  ApiCampaignSubmitRequest,
  ApiCampaignUpdateRequest,
} from "@/types/api/campaigns";

export type {
  UseCampaignEventsContext,
  UseCampaignEventsOptions,
} from "@/hooks/use-campaign-events";
export { useCampaignEvents } from "@/hooks/use-campaign-events";

export const campaignKeys = {
  all: ["campaigns"] as const,
  /** Invalidate every cached campaign list (all stores). */
  listPrefix: ["campaigns", "list"] as const,
  list: (storeScopeId: string | null) =>
    ["campaigns", "list", storeScopeId ?? "__org__"] as const,
  detail: (id: string, storeScopeId: string | null) =>
    ["campaigns", "detail", id, storeScopeId ?? "__org__"] as const,
  timeline: (id: string, storeScopeId: string | null) =>
    ["campaigns", "timeline", id, storeScopeId ?? "__org__"] as const,
  filters: ["campaigns", "filters"] as const,
  statDefinitions: ["campaigns", "statDefinitions"] as const,
  statusStyles: ["campaigns", "statusStyles"] as const,
  tableColumns: ["campaigns", "tableColumns"] as const,
  calendarWeekdays: ["campaigns", "calendarWeekdays"] as const,
  monthNames: ["campaigns", "monthNames"] as const,
};

export function useCampaignList() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: campaignKeys.list(storeId),
    queryFn: getCampaignList,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useCampaignFilters() {
  return useQuery({
    queryKey: campaignKeys.filters,
    queryFn: getCampaignFilters,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useCampaignStatDefinitions() {
  return useQuery({
    queryKey: campaignKeys.statDefinitions,
    queryFn: getCampaignStatDefinitions,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useCampaignStatusStyles() {
  return useQuery({
    queryKey: campaignKeys.statusStyles,
    queryFn: getCampaignStatusStyles,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useCampaignTableColumns() {
  return useQuery({
    queryKey: campaignKeys.tableColumns,
    queryFn: getCampaignTableColumns,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useCalendarWeekdays() {
  return useQuery({
    queryKey: campaignKeys.calendarWeekdays,
    queryFn: getCalendarWeekdays,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useMonthNames() {
  return useQuery({
    queryKey: campaignKeys.monthNames,
    queryFn: getMonthNames,
    staleTime: Infinity,
    gcTime: 10 * 60_000,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CampaignCreateForm) => createCampaign(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: CampaignCreateForm }) =>
      updateCampaign(id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast({
          title: "Cannot delete campaign",
          description:
            "Only makers and admins can delete campaigns. Your account has the checker role, which can review and approve but not delete.",
          variant: "destructive",
        });
      }
    },
  });
}

export function useEnterGuardrailsReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enterGuardrailsReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
    },
  });
}

export function useValidateCampaignGuardrails() {
  return useMutation({
    mutationFn: ({ id, guardrailIds }: { id: string; guardrailIds: string[] }) =>
      validateCampaignGuardrails(id, guardrailIds),
  });
}

export function usePatchCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApiCampaignUpdateRequest }) =>
      patchCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
    },
  });
}

export function useSubmitCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ApiCampaignSubmitRequest;
    }) => submitCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["approval", "inbox"] });
    },
  });
}

export function useApproveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ApiCampaignApproveRequest;
    }) => approveCampaign(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["approval", "inbox"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
    },
  });
}

export function useRejectCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["approval", "inbox"] });
    },
  });
}

/** Phase 1 – wizard NL draft (returns staged SKUs, does NOT persist yet) */
export function useDraftCampaign() {
  return useMutation({
    mutationFn: (payload: ApiCampaignDraftRequest) =>
      draftCampaignFromPrompt(payload),
  });
}

/** Phase 2 – wizard generate (persists campaign to DB, returns saved record) */
export function useGenerateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiCampaignGenerateRequest) =>
      generateCampaign(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Send a message to the LangGraph AI agent for a campaign */
export function useChatCampaign() {
  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: ApiCampaignChatRequest;
    }) => chatCampaign(campaignId, payload),
  });
}

/** Fetch a single campaign by id */
export function useCampaign(id: string) {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: campaignKeys.detail(id, storeId),
    queryFn: () => getCampaign(id),
    enabled: Boolean(id),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

/** Fetch the chronological event / chat timeline for a campaign */
export function useCampaignTimeline(campaignId: string) {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: campaignKeys.timeline(campaignId, storeId),
    queryFn: () => getCampaignTimeline(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 10_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Layout image the user selected in the studio, derived from the campaign
 * timeline (layout events + `submitted_for_approval` variant id). Reuses the
 * same query cache as {@link useCampaignTimeline}.
 */
export function useCampaignLayoutPreviewUrl(
  campaignId: string | undefined,
  options?: { hardwareOrder?: string[] },
) {
  const id = campaignId ?? "";
  const { data: events, isLoading } = useCampaignTimeline(id);
  const hardwareOrder = options?.hardwareOrder ?? [];
  const hardwareKey = hardwareOrder.join("\0");
  const imageUrl = useMemo(() => {
    if (!campaignId || !events) return undefined;
    const variants = extractVariantsFromEvents(events);
    return getScheduledPreviewImageUrl(
      variants,
      getSubmittedVariantId(events),
      hardwareOrder,
    );
  }, [campaignId, events, hardwareKey]);

  return { imageUrl, isLoading: Boolean(campaignId) && isLoading };
}

/**
 * Poll campaign events (legacy API). Prefer `useCampaignEvents` for start/stop/auto-stop.
 * `enabled` toggles polling without unmounting; timeline cache is scoped by store + campaign id.
 */
export function useCampaignEventsPolling(
  campaignId: string,
  enabled: boolean,
  intervalMs = 3_000,
) {
  const { events, isLoading, isFetching, error, refetch, startPolling, stopPolling } =
    useCampaignEvents(campaignId, {
      intervalMs,
      initialPolling: enabled,
      shouldStop: () => false,
    });

  useEffect(() => {
    if (enabled) startPolling();
    else stopPolling();
  }, [enabled, startPolling, stopPolling]);

  return {
    data: events,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

/** Post a chat message to the Campaign Studio AI (returns an event entry) */
export function usePostCampaignChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      payload,
    }: {
      campaignId: string;
      payload: ApiCampaignChatMessageRequest;
    }) => postCampaignChat(campaignId, payload),
    onSuccess: (_data, { campaignId }) => {
      qc.invalidateQueries({ queryKey: ["campaigns", "timeline", campaignId] });
    },
  });
}
