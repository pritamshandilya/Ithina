import { createFileRoute } from "@tanstack/react-router";

import CampaignsTabulator from "@/features/campaigns/campaigns-tabulator";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/campaigns")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: CampaignsTabulator,
});
