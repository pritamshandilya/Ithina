import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { hasPermission } from "@/lib/auth/authorization";
import { AuthSessionService } from "@/lib/auth/session";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

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
