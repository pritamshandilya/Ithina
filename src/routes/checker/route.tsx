/**
 * Checker Layout
 * 
 * Base layout for all checker-specific routes.
 * Wraps routes with MainLayout and applies consistent background styling.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import MainLayout from "@/components/layouts/main";
import { AuthSessionService } from "@/lib/auth/session";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "@/routes/-guards/requireAuth";

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
