import { createFileRoute } from "@tanstack/react-router";

import Fleet from "@/features/fleet";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/fleet")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: Fleet,
});
