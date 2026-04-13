import { createFileRoute } from "@tanstack/react-router";

import Admin from "@/features/admin";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/settings")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: Admin,
});
