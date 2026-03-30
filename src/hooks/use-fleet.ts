import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getFleetStats,
  getHardwareAlert,
  getQueueRows,
  resolveHardwareAlert,
} from "@/services/fleet";

export const fleetKeys = {
  all: ["fleet"] as const,
  stats: ["fleet", "stats"] as const,
  queue: ["fleet", "queue"] as const,
  alert: ["fleet", "alert"] as const,
};

export function useFleetStats() {
  return useQuery({
    queryKey: fleetKeys.stats,
    queryFn: getFleetStats,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useQueueRows() {
  return useQuery({
    queryKey: fleetKeys.queue,
    queryFn: getQueueRows,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
}

export function useHardwareAlertQuery() {
  return useQuery({
    queryKey: fleetKeys.alert,
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
      qc.invalidateQueries({ queryKey: fleetKeys.alert });
      qc.invalidateQueries({ queryKey: fleetKeys.stats });
    },
  });
}
