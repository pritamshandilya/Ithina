import { createFileRoute } from "@tanstack/react-router";

import CampaignsTabulator from "@/features/campaigns/campaigns-tabulator";

export const Route = createFileRoute("/_maker/maker/campaigns")({
  component: CampaignsTabulator,
});
