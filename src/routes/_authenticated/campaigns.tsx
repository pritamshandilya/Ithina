import { createFileRoute } from "@tanstack/react-router";

import Campaigns from "@/features/campaigns/campaigns-tabulator";

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: Campaigns,
});
