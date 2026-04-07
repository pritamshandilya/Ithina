import { createFileRoute } from "@tanstack/react-router";

import CheckerDashboard from "@/features/checker-dashboard";

export const Route = createFileRoute("/_checker/checker/dashboard")({
  component: CheckerDashboard,
});
