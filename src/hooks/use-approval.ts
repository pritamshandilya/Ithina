import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { toast } from "@/hooks/use-toast";
import { useActiveStoreId } from "@/hooks/use-active-store-id";
import { campaignKeys } from "@/hooks/use-campaigns";
import {
  approveInboxItem,
  getInboxItems,
  getPayloadManifest,
  rejectInboxItem,
  getValidationChecks,
  publishToFleet,
} from "@/services/approval";
import { organizationOverviewKeys } from "@/hooks/use-organization-overview";

export const approvalKeys = {
  all: ["approval"] as const,
  inboxPrefix: ["approval", "inbox"] as const,
  inbox: (storeScopeId: string | null) =>
    ["approval", "inbox", storeScopeId ?? "__org__"] as const,
  checks: ["approval", "checks"] as const,
  payload: ["approval", "payload"] as const,
};

export function useInboxItems() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: approvalKeys.inbox(storeId),
    queryFn: getInboxItems,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useValidationChecks() {
  return useQuery({
    queryKey: approvalKeys.checks,
    queryFn: getValidationChecks,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function usePayloadManifest() {
  return useQuery({
    queryKey: approvalKeys.payload,
    queryFn: getPayloadManifest,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function usePublishToFleet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishToFleet,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.inboxPrefix });
      qc.invalidateQueries({ queryKey: approvalKeys.checks });
    },
  });
}

export function useApproveInboxItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      scheduleType,
      selectedVariantId,
    }: {
      id: string;
      scheduleType?: "immediate" | "scheduled";
      selectedVariantId?: string;
    }) => approveInboxItem(id, scheduleType, selectedVariantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.inboxPrefix });
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast({
          title: "Cannot approve this campaign",
          description:
            "You cannot approve a campaign you submitted. Another checker must review it.",
          variant: "destructive",
        });
      }
    },
  });
}

export function useRejectInboxItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectInboxItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.inboxPrefix });
      qc.invalidateQueries({ queryKey: campaignKeys.listPrefix });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
    },
  });
}
