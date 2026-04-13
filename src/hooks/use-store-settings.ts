import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

import type { StoreDimensionUnit } from "@/constants/dimensions";
import { StoreContext } from "@/lib/store-context";
import {
  assignStoreUser,
  getAssignableStoreUsers,
  getStoreProfile,
  getStoreStaff,
  removeStoreUser,
  updateStoreProfile,
} from "@/services/store-settings";

export const storeSettingsKeys = {
  all: ["store-settings"] as const,
  profile: (storeId: string | null) => ["store-settings", "profile", storeId] as const,
  staff: (storeId: string | null) => ["store-settings", "staff", storeId] as const,
  assignable: (storeId: string | null) =>
    ["store-settings", "assignable", storeId] as const,
};

export function useActiveStoreId(): string | null {
  return useSyncExternalStore(
    StoreContext.subscribe,
    () => StoreContext.getStoreId(),
    () => null,
  );
}

export function useStoreProfile() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: storeSettingsKeys.profile(storeId),
    queryFn: getStoreProfile,
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });
}

export function useUpdateStoreProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      address: string;
      region: string;
      currency: string;
      defaultDimensions: StoreDimensionUnit;
    }) => updateStoreProfile(data),
    onSuccess: (next) => {
      const id = StoreContext.getStoreId();
      if (id) {
        qc.setQueryData(storeSettingsKeys.profile(id), next);
      }
    },
  });
}

export function useStoreStaff() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: storeSettingsKeys.staff(storeId),
    queryFn: getStoreStaff,
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });
}

export function useAssignableStoreUsers(options?: { enabled?: boolean }) {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: storeSettingsKeys.assignable(storeId),
    queryFn: getAssignableStoreUsers,
    staleTime: 5_000,
    enabled: (options?.enabled ?? true) && Boolean(storeId),
  });
}

export function useAssignStoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignStoreUser(userId),
    onSuccess: (next) => {
      const id = StoreContext.getStoreId();
      if (id) {
        qc.setQueryData(storeSettingsKeys.staff(id), next);
        qc.invalidateQueries({ queryKey: storeSettingsKeys.assignable(id) });
      }
    },
  });
}

export function useRemoveStoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeStoreUser(userId),
    onSuccess: (next) => {
      const id = StoreContext.getStoreId();
      if (id) {
        qc.setQueryData(storeSettingsKeys.staff(id), next);
        qc.invalidateQueries({ queryKey: storeSettingsKeys.assignable(id) });
      }
    },
  });
}
