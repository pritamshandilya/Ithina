import {
  MOCK_CAMPAIGN_LIST,
  MOCK_CALENDAR_WEEKDAYS,
  MOCK_CAMPAIGN_FILTERS,
  MOCK_CAMPAIGN_STAT_DEFINITIONS,
  MOCK_CAMPAIGN_STATUS_STYLES,
  MOCK_CAMPAIGN_TABLE_COLUMNS,
  MOCK_MONTH_NAMES,
} from "@/mocks/campaigns";
import { apiDelay } from "@/lib/api-delay";
import type {
  CampaignCreateForm,
  CampaignFilterOption,
  CampaignListItem,
  CampaignListStatus,
  CampaignStatDefinition,
  CampaignStatusStyle,
  CampaignTableColumn,
} from "@/types/campaigns";

let mockCampaigns: CampaignListItem[] = [...MOCK_CAMPAIGN_LIST];

function derivePipeline(status: CampaignListStatus): string[] {
  // Matches the HTML prototype stage names.
  switch (status) {
    case "Active":
    case "Completed":
      return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
    case "Scheduled":
      return ["Data", "Design", "Guard Rails", "Scheduled"];
    case "Draft":
      return ["Data", "Design"];
    case "Rejected":
      return ["Data", "Design", "Guard Rails", "Approval"];
    default:
      return ["Data"];
  }
}

function normalizePaused(status: CampaignListStatus, current?: boolean): boolean | undefined {
  // Prototype only toggles Pause/Resume for scheduled campaigns.
  if (status !== "Scheduled") return undefined;
  return typeof current === "boolean" ? current : false;
}

export async function getCampaignList(): Promise<CampaignListItem[]> {
  // UI parity first: the HTML prototype renders pipeline + paused state.
  // Until backend returns those fields, we use the mock list.
  await apiDelay(200);
  return mockCampaigns;
}

export async function createCampaign(form: CampaignCreateForm): Promise<CampaignListItem> {
  const hardware = form.hardware
    ? form.hardware
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  const next: CampaignListItem = {
    id: `CMP-${Date.now().toString().slice(-6)}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
    name: form.name,
    status: form.status,
    skus: Number(form.skus),
    hardware,
    date: form.scheduled_date || "—",
    initiator: form.initiator,
    pipeline: derivePipeline(form.status),
    paused: normalizePaused(form.status),
  };

  mockCampaigns = [next, ...mockCampaigns];
  await apiDelay(200);
  return next;
}

export async function updateCampaign(id: string, form: CampaignCreateForm): Promise<CampaignListItem> {
  const hardware = form.hardware
    ? form.hardware
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");

  const current = mockCampaigns[idx];
  const next: CampaignListItem = {
    ...current,
    name: form.name,
    status: form.status,
    skus: Number(form.skus),
    hardware,
    date: form.scheduled_date || current.date,
    initiator: form.initiator,
    pipeline: derivePipeline(form.status),
    paused: normalizePaused(form.status, current.paused),
  };

  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return next;
}

export async function deleteCampaign(id: string): Promise<void> {
  mockCampaigns = mockCampaigns.filter((c) => c.id !== id);
  await apiDelay(200);
}

export async function approveCampaign(id: string): Promise<CampaignListItem> {
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");

  const next: CampaignListItem = {
    ...mockCampaigns[idx],
    status: "Completed",
    pipeline: derivePipeline("Completed"),
    paused: undefined,
  };
  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return next;
}

export async function rejectCampaign(id: string): Promise<CampaignListItem> {
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");

  const next: CampaignListItem = {
    ...mockCampaigns[idx],
    status: "Rejected",
    pipeline: derivePipeline("Rejected"),
    paused: undefined,
  };
  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return next;
}

export async function createCampaignFromWizard(
  name: string,
  initiator: string = "Wizard",
  scheduledDate: string = "",
): Promise<CampaignListItem> {
  return createCampaign({
    name,
    status: scheduledDate ? "Scheduled" : "Draft",
    skus: 0,
    hardware: "",
    initiator,
    scheduled_date: scheduledDate,
  });
}

// TODO (backend): replace with axios.get("/api/campaigns/filters")
export async function getCampaignFilters(): Promise<CampaignFilterOption[]> {
  await apiDelay(200);
  return MOCK_CAMPAIGN_FILTERS;
}

// TODO (backend): replace with axios.get("/api/campaigns/stat-definitions")
export async function getCampaignStatDefinitions(): Promise<CampaignStatDefinition[]> {
  await apiDelay(200);
  return MOCK_CAMPAIGN_STAT_DEFINITIONS;
}

// TODO (backend): replace with axios.get("/api/campaigns/status-styles")
export async function getCampaignStatusStyles(): Promise<Record<CampaignListStatus, CampaignStatusStyle>> {
  await apiDelay(200);
  return MOCK_CAMPAIGN_STATUS_STYLES;
}

// TODO (backend): replace with axios.get("/api/campaigns/table-columns")
export async function getCampaignTableColumns(): Promise<CampaignTableColumn[]> {
  await apiDelay(200);
  return MOCK_CAMPAIGN_TABLE_COLUMNS;
}

// TODO (backend): replace with axios.get("/api/calendar/weekdays")
export async function getCalendarWeekdays(): Promise<string[]> {
  await apiDelay(200);
  return MOCK_CALENDAR_WEEKDAYS;
}

// TODO (backend): replace with axios.get("/api/calendar/month-names")
export async function getMonthNames(): Promise<string[]> {
  await apiDelay(200);
  return MOCK_MONTH_NAMES;
}
