import type {
  CampaignRow,
  InsightCardData,
  StatCardData,
} from "@/types/dashboard";

export const MOCK_STAT_CARDS: StatCardData[] = [
  {
    label: "Active Campaigns",
    value: "12",
    trend: { text: "+2 This Week", variant: "success" },
  },
  {
    label: "Pending Approvals",
    value: "3",
    trend: { text: "Requires Action", variant: "warning" },
  },
  {
    label: "Hardware Health",
    value: "99.8%",
    trend: { text: "Online", variant: "success" },
  },
  {
    label: "Est. Revenue Impact",
    value: "+$14k",
    trend: { text: "This Month", variant: "purple" },
  },
];

export const MOCK_INSIGHTS: InsightCardData[] = [
  {
    id: "insight-1",
    severity: "time-sensitive",
    title: "12 Sushi Trays Expiring",
    description:
      "ROOS detects 12 SKUs in the Perishables category reaching expiration in 48 hours. Estimated waste value: $892.",
    timestamp: "Just Now",
    actionLabel: "Draft Clearance Campaign",
  },
  {
    id: "insight-2",
    severity: "velocity-drop",
    title: "Beverage Category -8%",
    description:
      "Sales velocity for summer beverages has dropped 8% week-over-week. Inventory is backing up.",
    actionLabel: "Draft Weekend Promo",
  },
  {
    id: "insight-3",
    severity: "high-stock",
    title: "Premium Electronics",
    description:
      "High stock levels detected on high-margin headphones. Suggestion: Bundle or Flash Sale.",
    actionLabel: "Draft Flash Sale",
  },
];

export const MOCK_CAMPAIGNS: CampaignRow[] = [
  {
    id: "1",
    name: "Weekend Beverage Promo",
    campaignId: "CMP-9941-A",
    initiator: "System (Auto)",
    status: "live",
    statusLabel: "Live (100% Synced)",
    hardwareTargets: "Chroma 42, LCD Banners",
    lastUpdated: "Today, 08:45 AM",
  },
  {
    id: "2",
    name: "Electronics Flash Sale",
    campaignId: "CMP-8810-B",
    initiator: "Sarah J.",
    status: "pending",
    statusLabel: "Pending Approval",
    hardwareTargets: "Chroma 29, Chroma 16",
    lastUpdated: "Yesterday, 14:22 PM",
  },
  {
    id: "3",
    name: "Seasonal Apparel Markdowns",
    campaignId: "CMP-7705-C",
    initiator: "Marcus P.",
    status: "draft",
    statusLabel: "Draft",
    hardwareTargets: "Not defined",
    lastUpdated: "Oct 12, 11:05 AM",
  },
];

