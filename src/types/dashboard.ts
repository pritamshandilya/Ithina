export interface StatCardData {
  label: string;
  value: string;
  trend: {
    text: string;
    variant: "success" | "warning" | "info" | "purple";
  };
}

export type InsightSeverity = "time-sensitive" | "velocity-drop" | "high-stock";

export interface InsightCardData {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  timestamp?: string;
  actionLabel: string;
}

export type CampaignStatus = "live" | "pending" | "draft";

export interface CampaignRow {
  id: string;
  name: string;
  campaignId: string;
  initiator: string;
  status: CampaignStatus;
  statusLabel: string;
  hardwareTargets: string;
  lastUpdated: string;
}
