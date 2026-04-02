import { useQuery } from "@tanstack/react-query";

import {
  listOrganizationUsers,
  type ApiOrganizationUserResponse,
  type ApiUserRole,
} from "@/services/admin-users";

import type { OrgUser, UserRole } from "@/features/admin-users/types";

const roleMap: Record<ApiUserRole, UserRole> = {
  admin: "admin",
  maker: "maker",
  checker: "checker",
};

function mapOrganizationUser(u: ApiOrganizationUserResponse): OrgUser {
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    role: roleMap[u.role],
    status: u.is_active ? "active" : "inactive",
    storeIds: [],
    createdAt: "",
    lastLoginAt: u.last_login_at,
  };
}

export const adminUsersKeys = {
  list: ["admin-users", "list"] as const,
};

export function useAdminOrganizationUsers() {
  return useQuery({
    queryKey: adminUsersKeys.list,
    queryFn: async () => listOrganizationUsers().then((arr) => arr.map(mapOrganizationUser)),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
  });
}

