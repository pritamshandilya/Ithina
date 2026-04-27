import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizationOverviewKeys } from "@/hooks/use-organization-overview";
import { storeSettingsKeys } from "@/hooks/use-store-settings";
import { storesKeys } from "@/hooks/use-stores";
import {
  createStore,
  listStoreUsers,
  listStores,
  updateStore,
  updateStoreActive,
  type CreateStorePayload,
  type Store,
  type UpdateStorePayload,
} from "@/services/stores";

export const adminStoresKeys = {
  list: ["admin-stores", "list"] as const,
};

/** Queries scoped to the admin “Manage store staff” modal. */
export const adminManageStoreStaffKeys = {
  orgUsers: [...adminStoresKeys.list, "manage-staff-org-users"] as const,
  storeUsers: (storeId: string) =>
    [...adminStoresKeys.list, "manage-staff-store-users", storeId] as const,
};

export type StoreWithStaffCount = Store & { staffCount: number };

async function getStoresWithStaffCounts(): Promise<StoreWithStaffCount[]> {
  const stores = await listStores();

  // Staff count is computed via store-scoped /store/users calls.
  const storesWithCounts = await Promise.all(
    stores.map(async (s) => {
      const users = await listStoreUsers(s.id);
      return { ...s, staffCount: users.length };
    }),
  );

  return storesWithCounts;
}

export function useAdminStores() {
  return useQuery({
    queryKey: adminStoresKeys.list,
    queryFn: getStoresWithStaffCounts,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateAdminStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStorePayload) => createStore(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminStoresKeys.list });
    },
  });
}

export function useUpdateAdminStoreActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { storeId: string; is_active: boolean }) =>
      updateStoreActive(args.storeId, args.is_active),
    onSuccess: (_data, { storeId }) => {
      qc.invalidateQueries({ queryKey: adminStoresKeys.list });
      qc.invalidateQueries({ queryKey: storeSettingsKeys.profile(storeId) });
      qc.invalidateQueries({ queryKey: storeSettingsKeys.staff(storeId) });
      qc.invalidateQueries({ queryKey: storesKeys.all });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
    },
  });
}

export function useUpdateAdminStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { storeId: string; payload: UpdateStorePayload }) =>
      updateStore(args.storeId, args.payload),
    onSuccess: (_data, { storeId }) => {
      qc.invalidateQueries({ queryKey: adminStoresKeys.list });
      qc.invalidateQueries({ queryKey: storeSettingsKeys.profile(storeId) });
      qc.invalidateQueries({ queryKey: storesKeys.all });
      qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
    },
  });
}

