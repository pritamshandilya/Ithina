import { createFileRoute } from "@tanstack/react-router";

import AdminUsersPage from "@/features/admin-users";
import { assertAdminOrgRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/users")({
  beforeLoad: () => {
    assertAdminOrgRoute();
  },
  component: AdminUsersPage,
});
