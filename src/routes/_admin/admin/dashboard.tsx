import { createFileRoute } from "@tanstack/react-router";

import AdminDashboard from "@/features/admin-dashboard";

export const Route = createFileRoute("/_admin/admin/dashboard")({
  component: AdminDashboard,
});
