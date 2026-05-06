import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { hasPermission } from "@/lib/auth/authorization";
import { AuthSessionService } from "@/lib/auth/session";
import { requireAuth } from "@/routes/-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
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
