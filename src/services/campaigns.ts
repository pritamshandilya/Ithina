import {
  MOCK_CALENDAR_WEEKDAYS,
  MOCK_CAMPAIGN_FILTERS,
  MOCK_CAMPAIGN_LIST,
  MOCK_CAMPAIGN_STAT_DEFINITIONS,
  MOCK_CAMPAIGN_STATUS_STYLES,
  MOCK_CAMPAIGN_TABLE_COLUMNS,
  MOCK_MONTH_NAMES,
} from "@/mocks/campaigns";
import { apiDelay } from "@/lib/api-delay";
import { promoApiClient } from "@/lib/promo-api-client";
import type {
  CampaignFilterOption,
  CampaignListItem,
  CampaignListStatus,
  CampaignStatDefinition,
  CampaignStatusStyle,
  CampaignTableColumn,
} from "@/types/campaigns";

export async function getCampaignList(): Promise<CampaignListItem[]> {
  // TEMP (frontend-only): use mocked data until backend is wired
  await apiDelay(200);
  return MOCK_CAMPAIGN_LIST;
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
