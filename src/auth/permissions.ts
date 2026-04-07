export type Permission =
  | "dashboard:view"
  | "campaigns:create"
  | "campaigns:view"
  | "approvals:submit"
  | "approvals:review"
  | "fleet:view"
  | "studio:use"
  | "templates:view"
  | "stores:read"
  | "stores:manage"
  | "users:manage"
  | "admin:settings"
  | "store-settings:view";

export type UserRole = "admin" | "maker" | "checker";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "dashboard:view",
    "campaigns:create",
    "campaigns:view",
    "approvals:review",
    "fleet:view",
    "studio:use",
    "templates:view",
    "stores:read",
    "stores:manage",
    "users:manage",
    "admin:settings",
    "store-settings:view",
  ],
  maker: [
    "dashboard:view",
    "campaigns:create",
    "campaigns:view",
    "approvals:submit",
    "fleet:view",
    "studio:use",
    "templates:view",
    "stores:read",
    "store-settings:view",
  ],
  checker: [
    "dashboard:view",
    "campaigns:view",
    "approvals:review",
    "fleet:view",
    "templates:view",
    "stores:read",
    "store-settings:view",
  ],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
