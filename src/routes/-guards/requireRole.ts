import { redirect } from "@tanstack/react-router";

import { PromoAuthService, getDashboardUrlForRole } from "@/lib/auth/promo-auth";
import type { UserRole } from "@/auth/permissions";

/**
 * Route guard that ensures the current user has one of the required roles.
 * Redirects to login if not authenticated, or to their role dashboard if
 * they don't have an allowed role.
 */
export function requireRole(allowedRoles: UserRole[]) {
  const user = PromoAuthService.getCurrentUser();

  if (!user) {
    throw redirect({ to: "/login" });
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    const dashboardUrl = getDashboardUrlForRole(user.role);
    throw redirect({ to: dashboardUrl });
  }
}
