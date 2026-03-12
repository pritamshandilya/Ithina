import { useQuery } from "@tanstack/react-query";

import {
  getCampaignHistory,
  getDashboardInsights,
  getDashboardStatCards,
} from "@/services/dashboard";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  statCards: ["dashboard", "statCards"] as const,
  insights: ["dashboard", "insights"] as const,
  campaigns: ["dashboard", "campaigns"] as const,
};

export function useStatCards() {
  return useQuery({
    queryKey: dashboardKeys.statCards,
    queryFn: getDashboardStatCards,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: dashboardKeys.insights,
    queryFn: getDashboardInsights,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useCampaignHistory() {
  return useQuery({
    queryKey: dashboardKeys.campaigns,
    queryFn: getCampaignHistory,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
