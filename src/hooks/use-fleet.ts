import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getFleetStats,
  getHardwareAlert,
  getQueueRows,
  resolveHardwareAlert,
} from "@/services/fleet";

export function useFleetStats() {
  return useQuery({ queryKey: ["fleet", "stats"], queryFn: getFleetStats });
}

export function useQueueRows() {
  return useQuery({ queryKey: ["fleet", "queue"], queryFn: getQueueRows });
}

export function useHardwareAlertQuery() {
  return useQuery({ queryKey: ["fleet", "alert"], queryFn: getHardwareAlert });
}

export function useResolveAlert() {
  return useMutation({ mutationFn: resolveHardwareAlert });
}
