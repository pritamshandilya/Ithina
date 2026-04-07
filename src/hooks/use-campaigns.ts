import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

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
  initCampaign,
  postCampaignChat,
  rejectCampaign,
  updateCampaign,
} from "@/services/campaigns";
import type { CampaignCreateForm } from "@/types/campaigns";
import type {
  ApiCampaignChatMessageRequest,
  ApiCampaignChatRequest,
  ApiCampaignDraftRequest,
  ApiCampaignGenerateRequest,
  ApiCampaignInitRequest,
} from "@/types/api/campaigns";

export const campaignKeys = {
  all: ["campaigns"] as const,
  list: ["campaigns", "list"] as const,
  detail: (id: string) => ["campaigns", "detail", id] as const,
  timeline: (id: string) => ["campaigns", "timeline", id] as const,
  filters: ["campaigns", "filters"] as const,
  statDefinitions: ["campaigns", "statDefinitions"] as const,
  statusStyles: ["campaigns", "statusStyles"] as const,
  tableColumns: ["campaigns", "tableColumns"] as const,
  calendarWeekdays: ["campaigns", "calendarWeekdays"] as const,
  monthNames: ["campaigns", "monthNames"] as const,
};

export function useCampaignList() {
  return useQuery({
    queryKey: campaignKeys.list,
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
      qc.invalidateQueries({ queryKey: campaignKeys.list });
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
      qc.invalidateQueries({ queryKey: campaignKeys.list });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.list });
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

export function useApproveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveCampaign(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: campaignKeys.list });
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
      qc.invalidateQueries({ queryKey: campaignKeys.list });
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
      qc.invalidateQueries({ queryKey: campaignKeys.list });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/** Initialize a campaign session (DB row + LangGraph thread) */
export function useInitCampaign() {
  return useMutation({
    mutationFn: (payload?: ApiCampaignInitRequest) =>
      initCampaign(payload),
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
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => getCampaign(id),
    enabled: Boolean(id),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

/** Fetch the chronological event / chat timeline for a campaign */
export function useCampaignTimeline(campaignId: string) {
  return useQuery({
    queryKey: campaignKeys.timeline(campaignId),
    queryFn: () => getCampaignTimeline(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 10_000,
    gcTime: 5 * 60_000,
  });
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
      qc.invalidateQueries({ queryKey: campaignKeys.timeline(campaignId) });
    },
  });
}
