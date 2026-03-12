import { MOCK_CAMPAIGNS, MOCK_INSIGHTS, MOCK_STAT_CARDS } from "@/mocks/dashboard";
import { apiDelay } from "@/lib/api-delay";
import type {
  CampaignRow,
  InsightCardData,
  StatCardData,
} from "@/types/dashboard";

// TODO (backend): replace with axios.get("/api/dashboard/stats")
export async function getDashboardStatCards(): Promise<StatCardData[]> {
  await apiDelay(300);
  return MOCK_STAT_CARDS;
}

// TODO (backend): replace with axios.get("/api/dashboard/insights")
export async function getDashboardInsights(): Promise<InsightCardData[]> {
  await apiDelay(300);
  return MOCK_INSIGHTS;
}

// TODO (backend): replace with axios.get("/api/dashboard/campaigns")
export async function getCampaignHistory(): Promise<CampaignRow[]> {
  await apiDelay(300);
  return MOCK_CAMPAIGNS;
}
