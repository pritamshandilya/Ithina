import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type CreateStoreFixturesBulkPayload,
  type UpdateStoreFixturePayload,
  assignPlanogramToFixture,
  clearPlanogramFromFixture,
  createStoreFixturesBulk,
  deleteStoreFixture,
  updateStoreFixture,
} from "@/lib/api/checker/fixtures";
import { storeDefaultsKeys } from "@/queries/checker/hooks/useStoreFixtureTypes";

interface UpdateFixtureInput {
  storeId: string;
  fixtureId: string;
  payload: UpdateStoreFixturePayload;
}

interface DeleteFixtureInput {
  storeId: string;
  fixtureId: string;
}

interface AssignPlanogramInput {
  storeId: string;
  fixtureId: string;
  planogramId: string;
}

interface ClearPlanogramInput {
  storeId: string;
  fixtureId: string;
}

interface CreateBulkFixturesInput {
  storeId: string;
  payload: CreateStoreFixturesBulkPayload;
}

export function useUpdateFixture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, fixtureId, payload }: UpdateFixtureInput) =>
      updateStoreFixture(storeId, fixtureId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", variables.storeId],
        }),
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(variables.storeId),
        }),
      ]);
    },
  });
}

export function useDeleteFixture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, fixtureId }: DeleteFixtureInput) =>
      deleteStoreFixture(storeId, fixtureId),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", variables.storeId],
        }),
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(variables.storeId),
        }),
      ]);
    },
  });
}

export function useAssignPlanogramToFixture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, fixtureId, planogramId }: AssignPlanogramInput) =>
      assignPlanogramToFixture(storeId, fixtureId, planogramId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list", variables.storeId],
      });
    },
  });
}

export function useClearPlanogramFromFixture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, fixtureId }: ClearPlanogramInput) =>
      clearPlanogramFromFixture(storeId, fixtureId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["maker", "fixtures", "list", variables.storeId],
      });
    },
  });
}

export function useCreateBulkFixtures() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, payload }: CreateBulkFixturesInput) =>
      createStoreFixturesBulk(storeId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["maker", "fixtures", "list", variables.storeId],
        }),
        queryClient.invalidateQueries({
          queryKey: storeDefaultsKeys.fixtureTypes(variables.storeId),
        }),
      ]);
    },
  });
}
