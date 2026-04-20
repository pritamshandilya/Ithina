export type CampaignListStatus = "Active" | "Scheduled" | "Completed" | "Draft" | "Pending" | "Rejected";

export interface CampaignListItem {
  id: string;
  name: string;
  status: CampaignListStatus;
  /** Raw API status string (e.g. pending_approval, publishing) for fleet and tooling. */
  apiStatus?: string;
  /** From API `guardrails_status` — drives pipeline when status is `draft`. */
  guardrailsStatus?: "pass" | "warn" | "fail";
  /**
   * Prototype-only UI fields (used for the campaign pipeline breadcrumb in /campaigns).
   * Backend integration may provide this later; keeping optional avoids breaking API payloads.
   */
  pipeline?: string[];
  paused?: boolean;
  skus: number;
  hardware: string[];
  date: string;
  /** ISO 8601 from API `created_at` (for dashboards / trends). */
  createdAt: string;
  initiator: string;
  ownerId?: string;
  ownerName?: string;
  submittedForApproval?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  reviewedById?: string;
  reviewedByName?: string;
  reviewedByRole?: "checker" | "admin";
  reviewedAt?: string;
  publishedAt?: string;
  scheduledAt?: string;
  /** ISO string when the campaign run should end (from API `scheduled_end`). */
  scheduledEndAt?: string;
  /** Time-of-day label from API (`scheduled_time`), e.g. `08:00`. */
  scheduledTime?: string;
  /** Full SKU detail rows from the API response (used for ESL preview placeholder substitution). */
  rawSkus?: import("@/types/api/campaigns").ApiCampaignSKU[];
}

export interface CampaignStatCard {
  label: string;
  value: number;
  tag: string;
  color: string;
}

export interface CampaignStatDefinition {
  label: string;
  tag: string;
  color: string;
  countStatus: CampaignListStatus | null;
}

export interface CalendarEvent {
  name: string;
  cls: string;
}

export interface CalendarCell {
  day: number | string;
  isToday?: boolean;
  events: CalendarEvent[];
}

export interface CampaignStatusStyle {
  table: string;
  calendar: string;
}

export interface CampaignTableColumn {
  key: string;
  label: string;
  align?: "left" | "right";
}

export type CampaignFilterOption = "All" | CampaignListStatus;

export interface CampaignCreateForm {
  name: string;
  status: CampaignListStatus;
  skus: number;
  hardware: string;
  initiator: string;
  scheduled_date: string;
}

export interface CampaignEditForm extends CampaignCreateForm {
  id: string;
}
