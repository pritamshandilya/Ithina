import { createFileRoute } from "@tanstack/react-router";
import { StoreConfigurationPage } from "@/features/checker/stores/components/StoreConfigurationPage";

export const Route = createFileRoute("/checker/store-settings")({
  component: StoreConfigurationPage,
});
