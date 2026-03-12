import { MOCK_CAMPAIGNS, MOCK_INSIGHTS, MOCK_STAT_CARDS } from "@/mocks/dashboard";
import type {
  CampaignRow,
  InsightCardData,
  StatCardData,
} from "@/types/dashboard";

export async function getDashboardStatCards(): Promise<StatCardData[]> {
  // In future, replace with axios.get("/api/dashboard/stats")
  return MOCK_STAT_CARDS;
}

export async function getDashboardInsights(): Promise<InsightCardData[]> {
  // In future, replace with axios.get("/api/dashboard/insights")
  return MOCK_INSIGHTS;
}

export async function getCampaignHistory(): Promise<CampaignRow[]> {
  // In future, replace with axios.get("/api/dashboard/campaigns")
  return MOCK_CAMPAIGNS;
}

