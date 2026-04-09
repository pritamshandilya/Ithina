import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminUser,
  deleteAdminUser,
  listOrganizationUsers,
  updateAdminUser,
  type ApiOrganizationUserResponse,
  type ApiUserCreateRequest,
  type ApiUserRole,
  type ApiUserUpdateRequest,
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

export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApiUserCreateRequest) => createAdminUser(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKeys.list });
    },
  });
}

export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: ApiUserUpdateRequest }) =>
      updateAdminUser(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKeys.list });
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminUsersKeys.list });
    },
  });
}

