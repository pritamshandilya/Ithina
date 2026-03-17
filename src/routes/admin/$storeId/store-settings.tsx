import { createFileRoute } from "@tanstack/react-router";

import { StoreConfigurationPage } from "@/components/checker/stores/StoreConfigurationPage";

export const Route = createFileRoute("/admin/$storeId/store-settings")({
  component: () => <StoreConfigurationPage canEdit />,
});

