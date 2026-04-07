import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStore,
  listStoreUsers,
  listStores,
  updateStoreActive,
  type CreateStorePayload,
  type Store,
} from "@/services/stores";

export const adminStoresKeys = {
  list: ["admin-stores", "list"] as const,
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminStoresKeys.list });
    },
  });
}

