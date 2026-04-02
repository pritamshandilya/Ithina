import { useQuery } from "@tanstack/react-query";

import { listOrganizationUsers } from "@/services/organization";
import { listStores } from "@/services/stores";

export type OrganizationOverviewStats = {
  totalUsers: number;
  activeUsers: number;
  totalStores: number;
  activeStores: number;
  trendUsersText: string;
  trendStoresText: string;
};

export const organizationOverviewKeys = {
  stats: ["organization-overview", "stats"] as const,
};

async function fetchOrganizationOverviewStats(): Promise<OrganizationOverviewStats> {
  const [users, stores] = await Promise.all([listOrganizationUsers(), listStores()]);

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

  return {
    totalUsers,
    activeUsers,
    totalStores,
    activeStores,
    trendUsersText,
    trendStoresText,
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

