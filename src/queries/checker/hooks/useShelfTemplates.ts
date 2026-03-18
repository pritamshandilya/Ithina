import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createShelfTemplate,
  deleteShelfTemplate,
  fetchShelfTemplates,
  updateShelfTemplate,
} from "@/queries/checker/api/shelf-templates";
import { useSelectedStoreId } from "@/providers/store";
import type {
  ShelfTemplateCreateInput,
  ShelfTemplateUpdateInput,
} from "@/types/shelf-template";

export const shelfTemplateKeys = {
  all: ["shelf-templates"] as const,
  list: (storeId: string | undefined) =>
    [...shelfTemplateKeys.all, "list", storeId ?? "no-store"] as const,
};

export function useShelfTemplates() {
  const storeId = useSelectedStoreId();
  return useQuery({
    queryKey: shelfTemplateKeys.list(storeId),
    queryFn: () => fetchShelfTemplates(storeId!),
    enabled: !!storeId,
    staleTime: 60_000,
  });
}

export function useCreateShelfTemplate() {
  const storeId = useSelectedStoreId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ShelfTemplateCreateInput) =>
      createShelfTemplate(storeId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shelfTemplateKeys.all });
    },
  });
}

export function useUpdateShelfTemplate() {
  const storeId = useSelectedStoreId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ShelfTemplateUpdateInput) =>
      updateShelfTemplate(storeId!, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shelfTemplateKeys.all });
    },
  });
}

export function useDeleteShelfTemplate() {
  const storeId = useSelectedStoreId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteShelfTemplate(storeId!, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shelfTemplateKeys.all });
    },
  });
}

