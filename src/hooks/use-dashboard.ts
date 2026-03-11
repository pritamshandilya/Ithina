import { useQuery } from "@tanstack/react-query";

import {
  getCampaignHistory,
  getDashboardInsights,
  getDashboardStatCards,
} from "@/services/dashboard";

export function useStatCards() {
  return useQuery({ queryKey: ["dashboard", "statCards"], queryFn: getDashboardStatCards });
}

export function useInsights() {
  return useQuery({ queryKey: ["dashboard", "insights"], queryFn: getDashboardInsights });
}

export function useCampaignHistory() {
  return useQuery({ queryKey: ["dashboard", "campaigns"], queryFn: getCampaignHistory });
}
