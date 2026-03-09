import { redirect } from "@tanstack/react-router";

import type { AuthSessionUser } from "@/lib/auth/session";
import type { AppRouterContext } from "@/routes/__root";

interface RedirectLocation {
  href?: string;
}

export function requireAuth(
  context: AppRouterContext,
  location?: RedirectLocation,
): AuthSessionUser {
  if (!context.auth.isAuthenticated || !context.auth.user) {
    throw redirect({
      to: "/login",
      search: location?.href ? { redirect: location.href } : undefined,
    });
  }

  return context.auth.user;
}
