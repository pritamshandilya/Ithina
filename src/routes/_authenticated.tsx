import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { PromoAuthService } from "@/lib/auth/promo-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!PromoAuthService.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: MainLayout,
});
