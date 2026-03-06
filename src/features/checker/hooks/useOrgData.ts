import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStore,
  fetchOrgStores,
  fetchOrgUsers,
  fetchOrganization,
  fetchStoreById,
  fetchStoreUsers,
  updateStore,
  updateStoreMakers,
} from "../api/org";
import { storesKeys as checkerStoresKeys } from "./useStores";

/**
 * Query keys for organization-level data
 */
export const orgKeys = {
  all: ["org"] as const,
  details: () => [...orgKeys.all, "details"] as const,
  stores: () => [...orgKeys.all, "stores"] as const,
  store: (id: string) => [...orgKeys.stores(), id] as const,
  users: () => [...orgKeys.all, "users"] as const,
  storeUsers: (id: string) => [...orgKeys.store(id), "users"] as const,
};

/**
 * Hook to fetch current organization details
 */
export function useOrganization() {
  return useQuery({
    queryKey: orgKeys.details(),
    queryFn: fetchOrganization,
  });
}

/**
 * Hook to fetch all stores in the organization
 */
export function useOrgStores() {
  return useQuery({
    queryKey: orgKeys.stores(),
    queryFn: fetchOrgStores,
  });
}

/**
 * Hook to fetch a specific store by ID
 */
export function useStoreById(storeId: string) {
  return useQuery({
    queryKey: orgKeys.store(storeId),
    queryFn: () => fetchStoreById(storeId),
    enabled: !!storeId,
  });
}

/**
 * Hook to fetch all users (staff) in the organization
 */
export function useOrgUsers(userType?: "maker" | "checker") {
  return useQuery({
    queryKey: userType ? [...orgKeys.users(), userType] : orgKeys.users(),
    queryFn: () => fetchOrgUsers(userType),
  });
}

/**
 * Hook to fetch users assigned to a specific store
 */
export function useStoreUsers(storeId: string, userType?: "maker" | "checker") {
  return useQuery({
    queryKey: userType
      ? [...orgKeys.storeUsers(storeId), userType]
      : orgKeys.storeUsers(storeId),
    queryFn: () => fetchStoreUsers(storeId, userType),
    enabled: !!storeId,
  });
}

/**
 * Invalidate all store-related queries across the app
 */
function invalidateAllStoreQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({ queryKey: orgKeys.stores() });
  queryClient.invalidateQueries({ queryKey: checkerStoresKeys.all });
  queryClient.invalidateQueries({ queryKey: ["maker", "stores"] });
}

/**
 * Mutation to create a new store
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      invalidateAllStoreQueries(queryClient);
    },
  });
}

/**
 * Mutation to update a store
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: Parameters<typeof updateStore>[1];
    }) => updateStore(storeId, data),
    onSuccess: (_, { storeId }) => {
      invalidateAllStoreQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: orgKeys.store(storeId) });
    },
  });
}

/**
 * Mutation to update store makers
 */
export function useUpdateStoreMakers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      makerIds,
    }: {
      storeId: string;
      makerIds: string[];
    }) => updateStoreMakers(storeId, makerIds),
    onSuccess: (_, { storeId }) => {
      invalidateAllStoreQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: orgKeys.store(storeId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.storeUsers(storeId) });
    },
  });
}
