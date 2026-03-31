import { createFileRoute } from "@tanstack/react-router";

import StoreSettings from "@/features/store-settings";

export const Route = createFileRoute("/_checker/checker/store-settings")({
  component: StoreSettings,
});
