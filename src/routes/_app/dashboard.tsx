import { createFileRoute, redirect } from "@tanstack/react-router";

import { AuthSessionService } from "@/lib/auth/session";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requirePermission } from "@/routes/-guards/requirePermission";
import store from "@/store";
import { selectSelectedStore } from "@/store/selectors";

export const Route = createFileRoute("/_app/dashboard")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    const user = requirePermission(context, "dashboard:view");

    if (user.role === "admin") {
      throw redirect({ to: "/admin/dashboard" });
    }

    const selectedStore = selectSelectedStore(store.getState());
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
