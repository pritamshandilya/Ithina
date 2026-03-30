import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { StoreDimensionUnit } from "@/constants/dimensions";
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
  profile: ["store-settings", "profile"] as const,
  staff: ["store-settings", "staff"] as const,
  assignable: ["store-settings", "assignable"] as const,
};

export function useStoreProfile() {
  return useQuery({
    queryKey: storeSettingsKeys.profile,
    queryFn: getStoreProfile,
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
      qc.setQueryData(storeSettingsKeys.profile, next);
    },
  });
}

export function useStoreStaff() {
  return useQuery({
    queryKey: storeSettingsKeys.staff,
    queryFn: getStoreStaff,
    staleTime: 15_000,
  });
}

export function useAssignableStoreUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: storeSettingsKeys.assignable,
    queryFn: getAssignableStoreUsers,
    staleTime: 5_000,
    enabled: options?.enabled ?? true,
  });
}

export function useAssignStoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignStoreUser(userId),
    onSuccess: (next) => {
      qc.setQueryData(storeSettingsKeys.staff, next);
      qc.invalidateQueries({ queryKey: storeSettingsKeys.assignable });
    },
  });
}

export function useRemoveStoreUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeStoreUser(userId),
    onSuccess: (next) => {
      qc.setQueryData(storeSettingsKeys.staff, next);
      qc.invalidateQueries({ queryKey: storeSettingsKeys.assignable });
    },
  });
}
