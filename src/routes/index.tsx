import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthSessionService } from "@/lib/auth/session";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthSessionService.getCurrentUser();
    if (user) {
      navigate({ to: AuthSessionService.getDashboardRoute(user.role) });
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return null;
}
