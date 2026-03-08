import type { AuthSessionUser } from "@/lib/auth/session";

import {
  ROLE_PERMISSIONS,
  type Permission,
  isPermission,
} from "./permissions";

export function effectivePermissions(
  user: AuthSessionUser | null | undefined,
): Set<Permission> {
  if (!user) return new Set<Permission>();

  const explicit = user.permissions?.filter(isPermission);
  const fallback = ROLE_PERMISSIONS[user.role];
  return new Set(explicit?.length ? explicit : fallback);
}

export function hasPermission(
  user: AuthSessionUser | null | undefined,
  permission: Permission,
): boolean {
  return effectivePermissions(user).has(permission);
}

export function hasAnyPermission(
  user: AuthSessionUser | null | undefined,
  permissions: readonly Permission[],
): boolean {
  const granted = effectivePermissions(user);
  return permissions.some((permission) => granted.has(permission));
}

export function hasStoreScope(
  user: AuthSessionUser | null | undefined,
  storeId: string,
): boolean {
  if (!user) return false;
  if (!user.storeIds?.length) return true;
  return user.storeIds.includes(storeId);
}
