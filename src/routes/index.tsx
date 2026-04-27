import { createFileRoute, redirect } from "@tanstack/react-router";

import { getDashboardUrlForRole, PromoAuthService } from "@/lib/auth/promo-auth";
import { StoreContext } from "@/lib/store-context";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (PromoAuthService.isAuthenticated()) {
      const user = PromoAuthService.getCurrentUser();
      if (!user) {
        throw redirect({ to: "/login" });
      }
      if (user.role === "admin") {
        throw redirect({ to: getDashboardUrlForRole("admin") });
      }
      const storeId = StoreContext.getStoreId();
      throw redirect({ to: storeId ? getDashboardUrlForRole(user.role) : "/select-store" });
    }

    throw redirect({ to: "/login" });
  },
});

