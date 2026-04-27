import { useQuery } from "@tanstack/react-query";

import { getAllWorkflowCampaigns } from "@/services/campaigns";
import { listOrganizationUsers } from "@/services/organization";
import { listStores } from "@/services/stores";

export type OrganizationOverviewStats = {
  totalUsers: number;
  activeUsers: number;
  totalStores: number;
  activeStores: number;
  trendUsersText: string;
  trendStoresText: string;
  pendingApprovals: number;
  reviewedAccepted: number;
  reviewedRejected: number;
};

export const organizationOverviewKeys = {
  stats: ["organization-overview", "stats"] as const,
};

async function fetchOrganizationOverviewStats(): Promise<OrganizationOverviewStats> {
  const [users, stores, campaigns] = await Promise.all([
    listOrganizationUsers(),
    listStores(),
    getAllWorkflowCampaigns().catch(() => []),
  ]);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;

  const totalStores = stores.length;
  const activeStores = stores.filter((s) => s.is_active).length;

  const trendUsersText =
    totalUsers > 0 && activeUsers === totalUsers
      ? "Org Active"
      : `${activeUsers}/${totalUsers} Active`;

  const trendStoresText =
    totalStores > 0 && activeStores === totalStores
      ? "All Online"
      : `${activeStores}/${totalStores} Online`;

  const pendingApprovals = campaigns.filter(
    (c) => c.submittedForApproval && c.approvalStatus === "pending",
  ).length;

  const reviewedAccepted = campaigns.filter((c) => c.approvalStatus === "approved").length;
  const reviewedRejected = campaigns.filter((c) => c.approvalStatus === "rejected").length;

  return {
    totalUsers,
    activeUsers,
    totalStores,
    activeStores,
    trendUsersText,
    trendStoresText,
    pendingApprovals,
    reviewedAccepted,
    reviewedRejected,
  };
}

export function useOrganizationOverviewStats() {
  return useQuery({
    queryKey: organizationOverviewKeys.stats,
    queryFn: fetchOrganizationOverviewStats,
    staleTime: 20_000,
    gcTime: 5 * 60_000,
  });
}

