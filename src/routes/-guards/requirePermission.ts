import { redirect } from "@tanstack/react-router";

import { requireAuth } from "./requireAuth";
import { hasPermission } from "@/lib/auth/authorization";
import type { Permission } from "@/lib/auth/permissions";
import type { AppRouterContext } from "@/routes/__root";

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
