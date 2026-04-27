import type { CampaignListItem, CampaignListStatus } from "@/types/campaigns";
import type { CampaignRow, CampaignStatus, StatCardData } from "@/types/dashboard";

function mapListStatusToDashboard(status: CampaignListStatus): {
  status: CampaignStatus;
  statusLabel: string;
} {
  switch (status) {
    case "Active":
      return { status: "live", statusLabel: "Active" };
    case "Scheduled":
      return { status: "live", statusLabel: "Scheduled" };
    case "Completed":
      return { status: "live", statusLabel: "Completed" };
    case "Pending":
      return { status: "pending", statusLabel: "Pending approval" };
    case "Rejected":
      return { status: "draft", statusLabel: "Rejected" };
    case "Draft":
    default:
      return { status: "draft", statusLabel: "Draft" };
  }
}

function pickLastUpdatedIso(item: CampaignListItem): string {
  const candidates = [
    item.reviewedAt,
    item.publishedAt,
    item.scheduledAt,
    item.createdAt,
  ].filter((v): v is string => Boolean(v?.trim()));

  if (candidates.length === 0) return item.createdAt;

  let best = candidates[0]!;
  let bestTime = new Date(best).getTime();
  for (const iso of candidates) {
    const t = new Date(iso).getTime();
    if (!Number.isNaN(t) && t >= bestTime) {
      best = iso;
      bestTime = t;
    }
  }
  return best;
}

function campaignListItemToRow(item: CampaignListItem): CampaignRow {
  const { status, statusLabel } = mapListStatusToDashboard(item.status);
  const hardwareTargets =
    item.hardware.length > 0
      ? item.hardware.join(", ")
      : item.status === "Draft"
        ? "Not defined"
        : "—";

  return {
    id: item.id,
    name: item.name,
    campaignId: item.id.length > 12 ? `${item.id.slice(0, 8)}…` : item.id,
    initiator: item.initiator?.trim() || "—",
    status,
    statusLabel,
    hardwareTargets,
    lastUpdated: pickLastUpdatedIso(item),
  };
}

/** Aggregates from the live campaign list for the current store (no mock numbers). */
export function buildDashboardStatCards(campaigns: CampaignListItem[]): StatCardData[] {
  const active = campaigns.filter(
    (c) => c.status === "Active" || c.status === "Scheduled",
  ).length;
  const pending = campaigns.filter((c) => c.status === "Pending").length;
  const drafts = campaigns.filter((c) => c.status === "Draft").length;
  const total = campaigns.length;

  return [
    {
      label: "Active Campaigns",
      value: String(active),
      trend: { text: "Live & scheduled", variant: "success" },
    },
    {
      label: "Pending Approvals",
      value: String(pending),
      trend: { text: "Awaiting review", variant: "warning" },
    },
    {
      label: "Drafts",
      value: String(drafts),
      trend: { text: "Not submitted", variant: "info" },
    },
    {
      label: "Total Campaigns",
      value: String(total),
      trend: { text: "In this store", variant: "purple" },
    },
  ];
}

export function buildCampaignHistoryRows(campaigns: CampaignListItem[]): CampaignRow[] {
  const rows = campaigns.map(campaignListItemToRow);
  rows.sort((a, b) => {
    const ta = new Date(a.lastUpdated).getTime();
    const tb = new Date(b.lastUpdated).getTime();
    return tb - ta;
  });
  return rows;
}
