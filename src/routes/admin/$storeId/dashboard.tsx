import { createFileRoute } from "@tanstack/react-router";
import { CheckerDashboard } from "@/routes/checker/dashboard/index";

export const Route = createFileRoute("/admin/$storeId/dashboard")({
  component: CheckerDashboard,
});
