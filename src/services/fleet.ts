import {
  MOCK_FLEET_STATS,
  MOCK_HARDWARE_ALERT,
  MOCK_QUEUE_ROWS,
} from "@/mocks/fleet";
import { apiDelay } from "@/lib/api-delay";
import type { FleetStat, HardwareAlert, QueueRow } from "@/types/fleet";

// TODO (backend): replace with axios.get("/api/fleet/stats")
export async function getFleetStats(): Promise<FleetStat[]> {
  await apiDelay(300);
  return MOCK_FLEET_STATS;
}

// TODO (backend): replace with axios.get("/api/fleet/queue")
export async function getQueueRows(): Promise<QueueRow[]> {
  await apiDelay(400);
  return MOCK_QUEUE_ROWS;
}

// TODO (backend): replace with axios.get("/api/fleet/hardware-alert")
export async function getHardwareAlert(): Promise<HardwareAlert | null> {
  await apiDelay(300);
  return MOCK_HARDWARE_ALERT;
}

// TODO (backend): replace with axios.post("/api/fleet/resolve-alert")
export async function resolveHardwareAlert(): Promise<void> {
  await apiDelay(1500);
}
