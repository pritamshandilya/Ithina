import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    if (!SimulatedAuthService.isAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: MainLayout,
});
