import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createGuardrail,
  deleteGuardrail,
  listGuardrails,
  updateGuardrail,
  type CreateGuardrailPayload,
} from "@/services/guardrails";

export const guardrailKeys = {
  all: ["guardrails"] as const,
  list: ["guardrails", "list"] as const,
};

export function useGuardrails() {
  return useQuery({
    queryKey: guardrailKeys.list,
    queryFn: listGuardrails,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateGuardrail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGuardrail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guardrailKeys.list });
    },
  });
}

export function useUpdateGuardrail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CreateGuardrailPayload> }) =>
      updateGuardrail(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guardrailKeys.list });
    },
  });
}

export function useDeleteGuardrail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGuardrail,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guardrailKeys.list });
    },
  });
}
