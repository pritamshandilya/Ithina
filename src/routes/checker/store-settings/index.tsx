import { createFileRoute } from "@tanstack/react-router";

import { StoreConfigurationPage } from "@/components/checker/stores/StoreConfigurationPage";

export const Route = createFileRoute("/checker/store-settings/")({
  component: CheckerStoreSettingsRoute,
});

function CheckerStoreSettingsRoute() {
  return <StoreConfigurationPage />;
}

