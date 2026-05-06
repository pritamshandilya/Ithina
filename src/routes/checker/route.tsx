/**
 * Checker Layout
 *
 * Base layout for all checker-specific routes.
 * Wraps routes with MainLayout and applies consistent background styling.
 */
import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { hasPermission } from "@/lib/auth/authorization";
import { AuthSessionService } from "@/lib/auth/session";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/checker")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    const user = requireAuth(context, location);

    if (!hasPermission(user, "approvals:review")) {
      throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
    }
  },
  component: CheckerLayout,
});

function CheckerLayout() {
  return <MainLayout />;
}
