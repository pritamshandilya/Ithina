export type CampaignListStatus = "Active" | "Scheduled" | "Completed" | "Draft" | "Rejected";

export interface CampaignListItem {
  id: string;
  name: string;
  status: CampaignListStatus;
  /**
   * Prototype-only UI fields (used for the campaign pipeline breadcrumb in /campaigns).
   * Backend integration may provide this later; keeping optional avoids breaking API payloads.
   */
  pipeline?: string[];
  paused?: boolean;
  skus: number;
  hardware: string[];
  date: string;
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
