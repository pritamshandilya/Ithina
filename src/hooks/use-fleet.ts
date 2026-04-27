import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useActiveStoreId } from "@/hooks/use-active-store-id";
import {
  getFleetStats,
  getHardwareAlert,
  getQueueRows,
  resolveHardwareAlert,
} from "@/services/fleet";

export const fleetKeys = {
  all: ["fleet"] as const,
  statsPrefix: ["fleet", "stats"] as const,
  stats: (storeScopeId: string | null) => ["fleet", "stats", storeScopeId ?? "__org__"] as const,
  queuePrefix: ["fleet", "queue"] as const,
  queue: (storeScopeId: string | null) => ["fleet", "queue", storeScopeId ?? "__org__"] as const,
  alertPrefix: ["fleet", "alert"] as const,
  alert: (storeScopeId: string | null) => ["fleet", "alert", storeScopeId ?? "__org__"] as const,
};

export function useFleetStats() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: fleetKeys.stats(storeId),
    queryFn: getFleetStats,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useQueueRows() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: fleetKeys.queue(storeId),
    queryFn: getQueueRows,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useHardwareAlertQuery() {
  const storeId = useActiveStoreId();
  return useQuery({
    queryKey: fleetKeys.alert(storeId),
    queryFn: getHardwareAlert,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveHardwareAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fleetKeys.alertPrefix });
      qc.invalidateQueries({ queryKey: fleetKeys.statsPrefix });
    },
  });
}
