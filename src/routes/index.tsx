import { createFileRoute, redirect } from "@tanstack/react-router";

import { PromoAuthService } from "@/lib/auth/promo-auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (PromoAuthService.isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }

    throw redirect({ to: "/login" });
  },
});

