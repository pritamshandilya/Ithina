import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignPlanogramToShelf, updateShelfArrangement } from "../api/planogram";
import { planogramShelfPreviewKeys } from "./usePlanogramShelfPreview";
import type { PlanogramArrangement } from "@/types/planogram";

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
