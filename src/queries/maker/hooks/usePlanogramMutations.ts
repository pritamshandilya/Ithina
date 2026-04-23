import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  assignPlanogramToShelf,
  createPlanogram,
  deletePlanogram,
  updatePlanogram,
  updateShelfArrangement,
} from "../api/planogram";
import { planogramKeys } from "./usePlanogramById";
import { planogramListKeys } from "./usePlanogramList";
import { planogramShelfPreviewKeys } from "./usePlanogramShelfPreview";
import type { PlanogramArrangement, PlanogramPayload } from "@/types/planogram";

interface AssignPlanogramToShelfInput {
  shelfId: string;
  planogramId: string;
  arrangement: PlanogramArrangement;
}

interface UpdateShelfArrangementInput {
  shelfId: string;
  arrangement: PlanogramArrangement;
}

export function useAssignPlanogramToShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shelfId,
      planogramId,
      arrangement,
    }: AssignPlanogramToShelfInput) =>
      assignPlanogramToShelf(shelfId, planogramId, arrangement),
    onSuccess: async (shelf) => {
      await queryClient.invalidateQueries({
        queryKey: ["maker", "shelves", "list"],
      });

      if (shelf) {
        await queryClient.invalidateQueries({
          queryKey: planogramShelfPreviewKeys.all,
        });
      }
    },
  });
}

export function useUpdateShelfArrangement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shelfId, arrangement }: UpdateShelfArrangementInput) =>
      updateShelfArrangement(shelfId, arrangement),
    onSuccess: async (updated) => {
      if (!updated) return;

      await queryClient.invalidateQueries({
        queryKey: planogramShelfPreviewKeys.all,
      });
    },
  });
}

export function useCreatePlanogram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlanogramPayload) => createPlanogram(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planogramListKeys.all });
    },
  });
}

interface UpdatePlanogramInput {
  id: string;
  payload: PlanogramPayload;
}

export function useUpdatePlanogram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdatePlanogramInput) =>
      updatePlanogram(id, payload),
    onSuccess: async (saved, variables) => {
      await queryClient.invalidateQueries({ queryKey: planogramListKeys.all });
      await queryClient.invalidateQueries({
        queryKey: planogramKeys.detail(variables.id),
      });
      await queryClient.setQueryData(planogramKeys.detail(variables.id), saved);
    },
  });
}

export function useDeletePlanogram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlanogram(id),
    onSuccess: async (removed, id) => {
      if (!removed) return;
      await queryClient.invalidateQueries({ queryKey: planogramListKeys.all });
      await queryClient.invalidateQueries({ queryKey: planogramKeys.detail(id) });
    },
  });
}
