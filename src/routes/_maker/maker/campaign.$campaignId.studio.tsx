import { createFileRoute } from "@tanstack/react-router";

import CampaignStudio from "@/features/campaign-studio";

export const Route = createFileRoute(
  "/_maker/maker/campaign/$campaignId/studio",
)({
  component: CampaignStudio,
});
