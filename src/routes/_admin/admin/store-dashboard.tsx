import { createFileRoute } from "@tanstack/react-router";

import MakerDashboard from "@/features/maker-dashboard";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/store-dashboard")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: AdminStoreDashboardPage,
});

function AdminStoreDashboardPage() {
  return <MakerDashboard variant="admin" />;
}
