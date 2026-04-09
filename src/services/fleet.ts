import { MOCK_FLEET_STATS, MOCK_HARDWARE_ALERT } from "@/mocks/fleet";
import { apiDelay } from "@/lib/api-delay";
import { getAllWorkflowCampaigns } from "@/services/campaigns";
import type { ApiCampaignStatus } from "@/types/api/campaigns";
import type { CampaignListItem } from "@/types/campaigns";
import type { FleetStat, HardwareAlert, QueueRow } from "@/types/fleet";

/** Post-approval / execution stages that belong on the Fleet queue. */
const FLEET_QUEUE_STATUSES = new Set<ApiCampaignStatus | string>([
  "approved",
  "scheduled",
  "publishing",
  "active",
]);

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Stable pseudo-progress for publishing rows when the API has no per-tag stream. */
function stableProgress(campaignId: string, total: number): number {
  if (total <= 0) return 0;
  const pct = (hashString(campaignId) % 100) / 100;
  return Math.min(total, Math.max(0, Math.floor(total * 0.55 + pct * total * 0.35)));
}

const STATUS_SORT: Record<string, number> = {
  publishing: 0,
  scheduled: 1,
  approved: 2,
  active: 3,
};

function fleetSortKey(c: CampaignListItem): number {
  const raw = (c.apiStatus ?? "").toLowerCase();
  return STATUS_SORT[raw] ?? 99;
}

function isFleetQueueCampaign(c: CampaignListItem): boolean {
  const raw = (c.apiStatus ?? "").toLowerCase();
  return FLEET_QUEUE_STATUSES.has(raw);
}

export function campaignToQueueRow(c: CampaignListItem): QueueRow {
  const raw = (c.apiStatus ?? "").toLowerCase();
  const total = Math.max(1, c.skus);
  const target = c.hardware.length ? c.hardware.join(", ") : "ESL";

  if (raw === "active") {
    return {
      id: c.id,
      name: c.name,
      target,
      totalTags: total,
      completedTags: total,
      state: "live",
      fleetState: "live",
    };
  }

  if (raw === "publishing") {
    const completed = stableProgress(c.id, total);
    const done = completed >= total;
    return {
      id: c.id,
      name: c.name,
      target,
      totalTags: total,
      completedTags: completed,
      state: done ? "completed" : "publishing",
      animated: !done,
      fleetState: "publishing",
    };
  }

  if (raw === "scheduled") {
    return {
      id: c.id,
      name: c.name,
      target,
      totalTags: total,
      completedTags: 0,
      state: "publishing",
      animated: true,
      fleetState: "scheduled",
    };
  }

  if (raw === "approved") {
    return {
      id: c.id,
      name: c.name,
      target,
      totalTags: total,
      completedTags: 0,
      state: "publishing",
      animated: false,
      fleetState: "scheduled",
    };
  }

  return {
    id: c.id,
    name: c.name,
    target,
    totalTags: total,
    completedTags: 0,
    state: "publishing",
    animated: false,
  };
}

// TODO (backend): replace with axios.get("/api/fleet/stats")
export async function getFleetStats(): Promise<FleetStat[]> {
  await apiDelay(300);
  const campaigns = await getAllWorkflowCampaigns();
  const fleet = campaigns.filter(isFleetQueueCampaign);
  const activeCount = fleet.length;
  const tagsTransit = fleet.reduce((sum, c) => {
    const row = campaignToQueueRow(c);
    if (row.state === "live") return sum;
    return sum + Math.max(0, row.totalTags - row.completedTags);
  }, 0);

  return MOCK_FLEET_STATS.map((s) =>
    s.label === "Active Batches"
      ? {
          ...s,
          value: String(Math.max(0, activeCount)),
          trend: activeCount > 0 ? "Running" : "Idle",
          trendVariant: activeCount > 0 ? "purple" : "muted",
        }
      : s.label === "Tags In Transit (RF)"
        ? { ...s, value: String(tagsTransit) }
        : s,
  );
}

// TODO (backend): replace with axios.get("/api/fleet/queue")
export async function getQueueRows(): Promise<QueueRow[]> {
  await apiDelay(400);
  const campaigns = await getAllWorkflowCampaigns();
  const fleet = campaigns.filter(isFleetQueueCampaign).sort((a, b) => fleetSortKey(a) - fleetSortKey(b));
  return fleet.map(campaignToQueueRow);
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
