import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    mutationFn: approveInboxItem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: approvalKeys.inbox });
      qc.invalidateQueries({ queryKey: ["campaigns", "list"] });
      qc.invalidateQueries({ queryKey: ["fleet"] });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
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
