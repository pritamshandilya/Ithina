import {
  MOCK_FLEET_STATS,
  MOCK_HARDWARE_ALERT,
  MOCK_QUEUE_ROWS,
} from "@/mocks/fleet";
import { apiDelay } from "@/lib/api-delay";
import { getAllWorkflowCampaigns } from "@/services/campaigns";
import type { FleetStat, HardwareAlert, QueueRow } from "@/types/fleet";

// TODO (backend): replace with axios.get("/api/fleet/stats")
export async function getFleetStats(): Promise<FleetStat[]> {
  await apiDelay(300);
  const campaigns = await getAllWorkflowCampaigns();
  const liveCount = campaigns.filter((c) => c.approvalStatus === "approved").length;
  const tagsTransit = campaigns
    .filter((c) => c.approvalStatus === "approved")
    .reduce((sum, c) => sum + c.skus, 0);

  return MOCK_FLEET_STATS.map((s) =>
    s.label === "Active Batches"
      ? { ...s, value: String(Math.max(1, liveCount)) }
      : s.label === "Tags In Transit (RF)"
        ? { ...s, value: String(tagsTransit) }
        : s,
  );
}

// TODO (backend): replace with axios.get("/api/fleet/queue")
export async function getQueueRows(): Promise<QueueRow[]> {
  await apiDelay(400);
  const campaigns = await getAllWorkflowCampaigns();
  const liveRows = campaigns
    .filter((c) => c.approvalStatus === "approved")
    .slice(0, 5)
    .map<QueueRow>((c) => ({
      name: c.name,
      target: c.hardware.join(", ") || "ESL",
      totalTags: c.skus,
      completedTags: c.skus,
      state: "live",
    }));
  return liveRows.length > 0 ? liveRows : MOCK_QUEUE_ROWS;
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
