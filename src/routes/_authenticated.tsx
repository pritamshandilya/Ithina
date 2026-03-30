import { createFileRoute, redirect } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";
import { isSessionAuthenticated } from "@/lib/auth/session";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: () => {
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";
    if (!skipAuth && !isSessionAuthenticated()) {
      throw redirect({ to: "/login" });
    }
  },
  component: MainLayout,
});
