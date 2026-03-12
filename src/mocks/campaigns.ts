import type {
  CampaignFilterOption,
  CampaignListItem,
  CampaignListStatus,
  CampaignStatDefinition,
  CampaignStatusStyle,
  CampaignTableColumn,
} from "@/types/campaigns";

export const MOCK_CAMPAIGN_LIST: CampaignListItem[] = [
  { id: "CMP-9941-A", name: "Weekend Beverage Promo", status: "Active", skus: 42, hardware: ["Chroma 42"], date: "Mar 8 2026", initiator: "System (Auto)" },
  { id: "CMP-9940-B", name: "Sushi Clearance — Urgent", status: "Completed", skus: 4, hardware: ["Chroma 42", "Chroma 29"], date: "Mar 7 2026", initiator: "Sarah J." },
  { id: "CMP-9939-C", name: "Electronics Flash Sale", status: "Draft", skus: 18, hardware: ["LCD Banner"], date: "Drafted Mar 6", initiator: "Sarah J." },
  { id: "CMP-9938-D", name: "Spring Produce Launch", status: "Scheduled", skus: 76, hardware: ["Chroma 42", "LCD Banner"], date: "Mar 15 2026", initiator: "Auto-Scheduled" },
  { id: "CMP-9937-E", name: "Dairy & Bakery Weekend", status: "Scheduled", skus: 31, hardware: ["Chroma 29"], date: "Mar 14 2026", initiator: "Marcus T." },
  { id: "CMP-9936-F", name: "BOGO Snacks Promotion", status: "Completed", skus: 22, hardware: ["Chroma 42"], date: "Mar 3 2026", initiator: "Sarah J." },
  { id: "CMP-9935-G", name: "Valentine's Day Special", status: "Completed", skus: 15, hardware: ["Chroma 42", "LCD Banner"], date: "Feb 14 2026", initiator: "Auto-Scheduled" },
  { id: "CMP-9934-H", name: "Cold & Flu Season Display", status: "Completed", skus: 9, hardware: ["Chroma 29"], date: "Feb 10 2026", initiator: "Marcus T." },
];

export const MOCK_CAMPAIGN_FILTERS: CampaignFilterOption[] = [
  "All",
  "Active",
  "Scheduled",
  "Completed",
  "Draft",
];

export const MOCK_CAMPAIGN_STAT_DEFINITIONS: CampaignStatDefinition[] = [
  { label: "Total Campaigns", tag: "All time", color: "text-white", countStatus: null },
  { label: "Active Now", tag: "Running", color: "text-ithina-purple", countStatus: "Active" },
  { label: "Scheduled", tag: "Upcoming", color: "text-amber-400", countStatus: "Scheduled" },
  { label: "Completed", tag: "This month", color: "text-emerald-400", countStatus: "Completed" },
];

export const MOCK_CAMPAIGN_STATUS_STYLES: Record<CampaignListStatus, CampaignStatusStyle> = {
  Active: {
    table: "text-ithina-purple border-ithina-purple/30 bg-ithina-purple/10",
    calendar: "bg-ithina-purple/20 text-ithina-purple",
  },
  Scheduled: {
    table: "text-amber-400 border-amber-400/30 bg-amber-400/10",
    calendar: "bg-amber-400/15 text-amber-400",
  },
  Completed: {
    table: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    calendar: "bg-emerald-400/15 text-emerald-400",
  },
  Draft: {
    table: "text-slate-400 border-slate-600 bg-white/5",
    calendar: "bg-slate-600/40 text-slate-400",
  },
};

export const MOCK_CAMPAIGN_TABLE_COLUMNS: CampaignTableColumn[] = [
  { key: "campaign", label: "Campaign" },
  { key: "status", label: "Status" },
  { key: "skus", label: "SKUs" },
  { key: "hardware", label: "Hardware" },
  { key: "date", label: "Date" },
  { key: "initiator", label: "Initiator" },
  { key: "actions", label: "Actions", align: "right" },
];

export const MOCK_CALENDAR_WEEKDAYS: string[] = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];

export const MOCK_MONTH_NAMES: string[] = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
