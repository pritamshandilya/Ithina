import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getInboxItems,
  getPayloadManifest,
  getValidationChecks,
  publishToFleet,
} from "@/services/approval";

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
