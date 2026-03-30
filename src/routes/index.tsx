import { createFileRoute, redirect } from "@tanstack/react-router";

import { isSessionAuthenticated } from "@/lib/auth/session";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";
    if (skipAuth || isSessionAuthenticated()) {
      throw redirect({ to: "/dashboard" });
    }

    throw redirect({ to: "/login" });
  },
});

