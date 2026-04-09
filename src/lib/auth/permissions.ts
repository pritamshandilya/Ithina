import type { UserRole } from "./session";

export interface RolePermissions {
  canManageUsers: boolean;
  canManageStores: boolean;
  canAssignStoreUsers: boolean;
  canViewAllStores: boolean;
  requiresStoreAssignmentForStoreAccess: boolean;
}

export const permissionsByRole: Record<UserRole, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canManageStores: true,
    canAssignStoreUsers: true,
    canViewAllStores: true,
    requiresStoreAssignmentForStoreAccess: false,
  },
  maker: {
    canManageUsers: false,
    canManageStores: false,
    canAssignStoreUsers: false,
    canViewAllStores: false,
    requiresStoreAssignmentForStoreAccess: true,
  },
  checker: {
    canManageUsers: false,
    canManageStores: false,
    canAssignStoreUsers: false,
    canViewAllStores: false,
    requiresStoreAssignmentForStoreAccess: true,
  },
};

export function getPermissions(role: UserRole): RolePermissions {
  return permissionsByRole[role];
}
