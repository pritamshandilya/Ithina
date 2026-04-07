import { createFileRoute } from "@tanstack/react-router";

import StoreSettings from "@/features/store-settings";

export const Route = createFileRoute("/_maker/maker/store-settings")({
  component: StoreSettings,
});
