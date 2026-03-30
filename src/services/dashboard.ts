import { apiDelay } from "@/lib/api-delay";
import {
  MOCK_CAMPAIGNS,
  MOCK_INSIGHTS,
  MOCK_STAT_CARDS,
} from "@/mocks/dashboard";
import type {
  CampaignRow,
  InsightCardData,
  StatCardData,
} from "@/types/dashboard";

export async function getDashboardStatCards(): Promise<StatCardData[]> {
  await apiDelay(200);
  return MOCK_STAT_CARDS;
}

export async function getDashboardInsights(): Promise<InsightCardData[]> {
  await apiDelay(200);
  return MOCK_INSIGHTS;
}

export async function getCampaignHistory(): Promise<CampaignRow[]> {
  await apiDelay(200);
  return MOCK_CAMPAIGNS;
}
