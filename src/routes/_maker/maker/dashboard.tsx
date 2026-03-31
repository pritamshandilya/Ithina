import { createFileRoute } from "@tanstack/react-router";

import MakerDashboard from "@/features/maker-dashboard";

export const Route = createFileRoute("/_maker/maker/dashboard")({
  component: MakerDashboard,
});
