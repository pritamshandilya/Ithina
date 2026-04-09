import { createFileRoute } from "@tanstack/react-router";

import { StoreConfigurationPage } from "@/components/checker/stores/StoreConfigurationPage";

export const Route = createFileRoute("/maker/store-settings/")({
  component: MakerStoreSettingsRoute,
});

function MakerStoreSettingsRoute() {
  return <StoreConfigurationPage />;
}

