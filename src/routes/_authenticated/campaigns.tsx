import { createFileRoute } from "@tanstack/react-router";

import CampaignsTabulator from "@/features/campaigns/campaigns-tabulator";

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: CampaignsTabulator,
});
