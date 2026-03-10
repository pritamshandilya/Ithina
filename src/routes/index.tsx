import { createFileRoute, redirect } from "@tanstack/react-router";

import { SimulatedAuthService } from "@/lib/auth/simulated-auth";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (SimulatedAuthService.isAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }

    throw redirect({ to: "/login" });
  },
});

