import { createFileRoute } from "@tanstack/react-router";

import AdminDashboard from "@/features/admin-dashboard";
import { assertAdminOrgRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  beforeLoad: () => {
    assertAdminOrgRoute();
  },
  component: AdminDashboard,
});
