import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { toast } from "@/hooks/use-toast";
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
  inbox: ["approval", "inbox"] as const,
  checks: ["approval", "checks"] as const,
  payload: ["approval", "payload"] as const,
};

export function useInboxItems() {
  return useQuery({
    queryKey: approvalKeys.inbox,
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
      qc.invalidateQueries({ queryKey: approvalKeys.inbox });
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
      qc.invalidateQueries({ queryKey: approvalKeys.inbox });
      qc.invalidateQueries({ queryKey: ["campaigns", "list"] });
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
      qc.invalidateQueries({ queryKey: approvalKeys.inbox });
      qc.invalidateQueries({ queryKey: ["campaigns", "list"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
    },
  });
}
