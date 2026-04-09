import { createFileRoute } from "@tanstack/react-router";

import AdminStoresPage from "@/features/admin-stores";
import { assertAdminOrgRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/stores/")({
  beforeLoad: () => {
    assertAdminOrgRoute();
  },
  component: AdminStoresPage,
});
