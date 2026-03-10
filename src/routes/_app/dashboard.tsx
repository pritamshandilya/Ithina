import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";
import { AuthSessionService } from "@/lib/auth/session";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: ({ context }) => {
    const user = requirePermission(context, "dashboard:view");
    
    if (user.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }

    // If store already selected, skip selection
    const selectedStore = localStorage.getItem("selected_store");
    if (selectedStore) {
      throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
    }

    const storeCount = user.storeIds?.length ?? 0;
    
    if (storeCount >= 1) {
      throw redirect({ to: "/select-store" });
    }

    throw redirect({ to: AuthSessionService.getDashboardRoute(user.role) });
  },
});
