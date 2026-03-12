import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getInboxItems,
  getPayloadManifest,
  getValidationChecks,
  publishToFleet,
} from "@/services/approval";

export function useInboxItems() {
  return useQuery({ queryKey: ["approval", "inbox"], queryFn: getInboxItems });
}

export function useValidationChecks() {
  return useQuery({ queryKey: ["approval", "checks"], queryFn: getValidationChecks });
}

export function usePayloadManifest() {
  return useQuery({ queryKey: ["approval", "payload"], queryFn: getPayloadManifest });
}

export function usePublishToFleet() {
  return useMutation({ mutationFn: publishToFleet });
}
