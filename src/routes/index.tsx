import { createFileRoute, redirect } from "@tanstack/react-router";

import { PromoAuthService, getDashboardUrlForRole } from "@/lib/auth/promo-auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (PromoAuthService.isAuthenticated()) {
      const user = PromoAuthService.getCurrentUser();
      const to = user ? getDashboardUrlForRole(user.role) : "/maker/dashboard";
      throw redirect({ to });
    }

    throw redirect({ to: "/login" });
  },
});

