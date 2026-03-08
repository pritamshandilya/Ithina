import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import MainLayout from "@/components/layouts/main";
import { AuthSessionService } from "@/lib/auth/session";
import { requireAuth } from "@/routes/-guards/requireAuth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    const user = requireAuth(context, location);

    if (!hasPermission(user, "stores:manage")) {
      throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <MainLayout />;
}
