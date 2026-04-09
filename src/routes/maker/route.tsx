import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import MainLayout from "@/components/layouts/main";
import { AuthSessionService } from "@/lib/auth/session";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "@/routes/-guards/requireAuth";

/**
 * Layout wrapper for all Maker routes
 * This provides consistent layout structure for the maker dashboard and sub-routes
 */
export const Route = createFileRoute("/maker")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    const user = requireAuth(context, location);

    if (!hasPermission(user, "approvals:submit")) {
      throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
    }
  },
  component: MakerLayout,
});

function MakerLayout() {
  return <MainLayout />;
}
