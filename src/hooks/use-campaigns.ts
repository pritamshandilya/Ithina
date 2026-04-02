import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveCampaign,
  createCampaign,
  deleteCampaign,
  draftCampaignFromPrompt,
  generateCampaign,
  getCalendarWeekdays,
  getCampaignFilters,
  getCampaignList,
  getCampaignStatDefinitions,
  getCampaignStatusStyles,
  getCampaignTableColumns,
  getMonthNames,
  rejectCampaign,
  updateCampaign,
} from "@/services/campaigns";
import type { CampaignCreateForm } from "@/types/campaigns";
import type {
  ApiCampaignDraftRequest,
  ApiCampaignGenerateRequest,
} from "@/types/api/campaigns";

export const campaignKeys = {
  all: ["campaigns"] as const,
  list: ["campaigns", "list"] as const,
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
