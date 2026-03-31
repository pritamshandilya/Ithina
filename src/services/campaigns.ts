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
import { PromoAuthService } from "@/lib/auth/promo-auth";
import type {
  CampaignCreateForm,
  CampaignFilterOption,
  CampaignListItem,
  CampaignListStatus,
  CampaignStatDefinition,
  CampaignStatusStyle,
  CampaignTableColumn,
} from "@/types/campaigns";

type WorkflowRecord = CampaignListItem & {
  ownerId: string;
  ownerName: string;
  submittedForApproval: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
};

const DEFAULT_OWNER_BY_INITIATOR: Record<string, { id: string; name: string }> = {
  "Sarah J.": { id: "maker-sarah", name: "Sarah J." },
  "Marcus T.": { id: "maker-marcus", name: "Marcus T." },
  "System (Auto)": { id: "maker-system", name: "System (Auto)" },
  "Auto-Scheduled": { id: "maker-auto", name: "Auto-Scheduled" },
};

let mockCampaigns: WorkflowRecord[] = MOCK_CAMPAIGN_LIST.map((row) => {
  const owner = DEFAULT_OWNER_BY_INITIATOR[row.initiator] ?? { id: "maker-generic", name: row.initiator };
  const submittedForApproval = row.status !== "Draft";
  const approvalStatus: WorkflowRecord["approvalStatus"] =
    row.status === "Rejected" ? "rejected" : submittedForApproval ? "approved" : "pending";

  return {
    ...row,
    ownerId: owner.id,
    ownerName: owner.name,
    submittedForApproval,
    approvalStatus,
    reviewedById: submittedForApproval ? "checker-bootstrap" : undefined,
    reviewedByName: submittedForApproval ? "John Checker" : undefined,
    reviewedByRole: submittedForApproval ? "checker" : undefined,
    reviewedAt: submittedForApproval ? row.date : undefined,
    publishedAt: row.status === "Active" || row.status === "Completed" ? row.date : undefined,
  };
});

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

function currentActor() {
  const user = PromoAuthService.getCurrentUser();
  return {
    id: user?.id ?? "unknown-user",
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "Unknown User",
    role: (user?.role ?? "maker") as "maker" | "checker" | "admin",
  };
}

function toCampaignListItem(row: WorkflowRecord): CampaignListItem {
  return { ...row };
}

function isMakerVisibleCampaign(row: WorkflowRecord, userId: string): boolean {
  return row.ownerId === userId;
}

function isReviewerVisibleCampaign(row: WorkflowRecord): boolean {
  return row.submittedForApproval;
}

export async function getCampaignList(): Promise<CampaignListItem[]> {
  const actor = currentActor();
  await apiDelay(200);
  if (actor.role === "maker") {
    return mockCampaigns.filter((row) => isMakerVisibleCampaign(row, actor.id)).map(toCampaignListItem);
  }
  return mockCampaigns.filter(isReviewerVisibleCampaign).map(toCampaignListItem);
}

export async function createCampaign(form: CampaignCreateForm): Promise<CampaignListItem> {
  const actor = currentActor();
  const hardware = form.hardware
    ? form.hardware
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
    : [];

  const isSubmitted = form.status !== "Draft";
  const next: WorkflowRecord = {
    id: `CMP-${Date.now().toString().slice(-6)}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
    name: form.name,
    status: form.status,
    skus: Number(form.skus),
    hardware,
    date: form.scheduled_date || "—",
    initiator: form.initiator,
    pipeline: derivePipeline(form.status),
    paused: normalizePaused(form.status),
    ownerId: actor.id,
    ownerName: actor.name,
    submittedForApproval: isSubmitted,
    approvalStatus: isSubmitted ? "pending" : "pending",
    reviewedById: undefined,
    reviewedByName: undefined,
    reviewedByRole: undefined,
    reviewedAt: undefined,
    publishedAt: undefined,
  };

  mockCampaigns = [next, ...mockCampaigns];
  await apiDelay(200);
  return toCampaignListItem(next);
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
  const isSubmitted = form.status !== "Draft";
  const next: WorkflowRecord = {
    ...current,
    name: form.name,
    status: form.status,
    skus: Number(form.skus),
    hardware,
    date: form.scheduled_date || current.date,
    initiator: form.initiator,
    pipeline: derivePipeline(form.status),
    paused: normalizePaused(form.status, current.paused),
    submittedForApproval: isSubmitted || current.submittedForApproval,
    approvalStatus:
      form.status === "Rejected"
        ? "rejected"
        : form.status === "Draft"
          ? current.approvalStatus
          : current.approvalStatus === "approved"
            ? "approved"
            : "pending",
  };

  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return toCampaignListItem(next);
}

export async function deleteCampaign(id: string): Promise<void> {
  mockCampaigns = mockCampaigns.filter((c) => c.id !== id);
  await apiDelay(200);
}

export async function approveCampaign(id: string): Promise<CampaignListItem> {
  const actor = currentActor();
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");

  const next: WorkflowRecord = {
    ...mockCampaigns[idx],
    status: "Active",
    pipeline: derivePipeline("Active"),
    paused: undefined,
    submittedForApproval: true,
    approvalStatus: "approved",
    reviewedById: actor.id,
    reviewedByName: actor.name,
    reviewedByRole: actor.role === "admin" ? "admin" : "checker",
    reviewedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return toCampaignListItem(next);
}

export async function rejectCampaign(id: string): Promise<CampaignListItem> {
  const actor = currentActor();
  const idx = mockCampaigns.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Campaign not found");

  const next: WorkflowRecord = {
    ...mockCampaigns[idx],
    status: "Rejected",
    pipeline: derivePipeline("Rejected"),
    paused: undefined,
    submittedForApproval: true,
    approvalStatus: "rejected",
    reviewedById: actor.id,
    reviewedByName: actor.name,
    reviewedByRole: actor.role === "admin" ? "admin" : "checker",
    reviewedAt: new Date().toISOString(),
  };
  mockCampaigns = mockCampaigns.map((c) => (c.id === id ? next : c));
  await apiDelay(200);
  return toCampaignListItem(next);
}

export async function getAllWorkflowCampaigns(): Promise<CampaignListItem[]> {
  await apiDelay(100);
  return mockCampaigns.map(toCampaignListItem);
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
