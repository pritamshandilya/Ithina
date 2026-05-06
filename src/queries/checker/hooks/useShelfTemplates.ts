import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createShelfTemplate,
  deleteShelfTemplate,
  fetchShelfTemplates,
  updateShelfTemplate,
} from "@/lib/api/checker/shelfTemplates";
import { useStore } from "@/providers/store";
import type {
  ShelfTemplateCreateInput,
  ShelfTemplateUpdateInput,
} from "@/types/shelfTemplate";

export const shelfTemplatesKeys = {
  all: ["shelf-templates"] as const,
  byStore: (storeId: string | undefined, unit: string) =>
    [...shelfTemplatesKeys.all, storeId ?? "all", unit] as const,
};

function getSelectedUnit(
  selectedStore: ReturnType<typeof useStore>["selectedStore"],
) {
  const unit = selectedStore?.default_dimensions;
  return (unit === "mm" || unit === "cm" || unit === "inch" ? unit : "mm") as
    | "mm"
    | "cm"
    | "inch";
}

export function useShelfTemplates() {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id;
  const unit = getSelectedUnit(selectedStore);

  return useQuery({
    queryKey: shelfTemplatesKeys.byStore(storeId, unit),
    queryFn: () => fetchShelfTemplates(storeId!, unit),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateShelfTemplate() {
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id;

  return useMutation({
    mutationFn: (payload: ShelfTemplateCreateInput) => {
      if (!storeId) throw new Error("Store not selected");
      return createShelfTemplate(storeId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shelfTemplatesKeys.all });
    },
  });
}

export function useUpdateShelfTemplate() {
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id;

  return useMutation({
    mutationFn: (payload: ShelfTemplateUpdateInput) => {
      if (!storeId) throw new Error("Store not selected");
      return updateShelfTemplate(storeId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shelfTemplatesKeys.all });
    },
  });
}

export function useDeleteShelfTemplate() {
  const queryClient = useQueryClient();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id;

  return useMutation({
    mutationFn: (id: string) => {
      if (!storeId) throw new Error("Store not selected");
      return deleteShelfTemplate(storeId, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shelfTemplatesKeys.all });
    },
  });
}
