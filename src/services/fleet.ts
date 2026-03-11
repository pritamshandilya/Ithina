import {
  MOCK_FLEET_STATS,
  MOCK_HARDWARE_ALERT,
  MOCK_QUEUE_ROWS,
} from "@/mocks/fleet";
import type { FleetStat, HardwareAlert, QueueRow } from "@/types/fleet";

export async function getFleetStats(): Promise<FleetStat[]> {
  return MOCK_FLEET_STATS;
}

export async function getQueueRows(): Promise<QueueRow[]> {
  return MOCK_QUEUE_ROWS;
}

export async function getHardwareAlert(): Promise<HardwareAlert | null> {
  return MOCK_HARDWARE_ALERT;
}

export async function resolveHardwareAlert(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
}
