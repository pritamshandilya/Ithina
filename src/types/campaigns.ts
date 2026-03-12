export type CampaignListStatus = "Active" | "Scheduled" | "Completed" | "Draft";

export interface CampaignListItem {
  id: string;
  name: string;
  status: CampaignListStatus;
  skus: number;
  hardware: string[];
  date: string;
  initiator: string;
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
