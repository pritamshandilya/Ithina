import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignUserToStore,
  createUser,
  createStore,
  deactivateUser,
  deleteStore,
  fetchOrgStores,
  fetchOrgUsers,
  fetchOrganization,
  fetchStoreById,
  fetchStoreUsers,
  fetchUserById,
  inviteUser,
  removeUserFromStore,
  updateUser,
  type OrgUserType,
  type UpsertUserPayload,
  updateStore,
  updateStoreComplianceSettings,
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
export function useOrgUsers(userType?: OrgUserType) {
  return useQuery({
    queryKey: [...orgKeys.users(), { userType: userType ?? "all" }],
    queryFn: () => fetchOrgUsers(userType),
  });
}

/**
 * Hook to fetch users assigned to a specific store
 */
export function useStoreUsers(storeId: string, userType?: OrgUserType) {
  return useQuery({
    queryKey: [
      ...orgKeys.storeUsers(storeId),
      { storeId, userType: userType ?? "all" },
    ],
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
 * Mutation to delete a store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => deleteStore(storeId),
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

export function useUpdateStoreComplianceSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: Parameters<typeof updateStoreComplianceSettings>[1];
    }) => updateStoreComplianceSettings(storeId, data),
    onSuccess: (_, { storeId }) => {
      invalidateAllStoreQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: orgKeys.store(storeId) });
    },
  });
}

/**
 * Mutation to assign a user to a store
 */
export function useAssignStoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      userId,
    }: {
      storeId: string;
      userId: string;
    }) => assignUserToStore(storeId, userId),
    onSuccess: (_, { storeId }) => {
      invalidateAllStoreQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: orgKeys.store(storeId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.storeUsers(storeId) });
    },
  });
}

/**
 * Mutation to remove a user from a store
 */
export function useRemoveStoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      userId,
    }: {
      storeId: string;
      userId: string;
    }) => removeUserFromStore(storeId, userId),
    onSuccess: (_, { storeId }) => {
      invalidateAllStoreQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: orgKeys.store(storeId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.storeUsers(storeId) });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertUserPayload) => createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.users() });
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertUserPayload) => inviteUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.users() });
    },
  });
}

export function useUserById(userId: string) {
  return useQuery({
    queryKey: [...orgKeys.users(), userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: Partial<UpsertUserPayload>;
    }) => updateUser(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.users() });
      queryClient.invalidateQueries({ queryKey: [...orgKeys.users(), userId] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.users() });
    },
  });
}
