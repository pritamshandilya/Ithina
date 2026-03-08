import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";
import { AuthSessionService } from "@/lib/auth/session";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: ({ context }) => {
    const user = requirePermission(context, "dashboard:view");
    throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
  },
});
