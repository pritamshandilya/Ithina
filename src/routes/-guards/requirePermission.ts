import { redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import type { Permission } from "@/auth/permissions";
import type { AppRouterContext } from "@/routes/__root";

import { requireAuth } from "./requireAuth";

export function requirePermission(
  context: AppRouterContext,
  permission: Permission,
) {
  const user = requireAuth(context);

  if (!hasPermission(user, permission)) {
    throw redirect({ to: "/forbidden" });
  }

  return user;
}
