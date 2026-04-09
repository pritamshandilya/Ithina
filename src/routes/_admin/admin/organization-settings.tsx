import { createFileRoute } from "@tanstack/react-router";

import AdminOrganizationSettingsPage from "@/features/admin-organization-settings";
import { assertAdminOrgRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/organization-settings")({
  beforeLoad: () => {
    assertAdminOrgRoute();
  },
  component: AdminOrganizationSettingsPage,
});
