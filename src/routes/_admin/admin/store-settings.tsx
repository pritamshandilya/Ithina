import { createFileRoute } from "@tanstack/react-router";

import StoreSettings from "@/features/store-settings";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/store-settings")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: StoreSettings,
});
