import { createFileRoute } from "@tanstack/react-router";

import StoreCreateWizardPage from "@/features/admin-stores/store-create-wizard-page";
import { assertAdminOrgRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/stores/new")({
  beforeLoad: () => {
    assertAdminOrgRoute();
  },
  component: StoreCreateWizardPage,
});
