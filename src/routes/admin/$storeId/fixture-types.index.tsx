import { createFileRoute } from "@tanstack/react-router";

import { StoreFixturesPage } from "@/components/checker/stores/StoreFixturesPage";

export const Route = createFileRoute("/admin/$storeId/fixture-types/")({
  component: AdminFixtureTypesIndexRoute,
});

function AdminFixtureTypesIndexRoute() {
  return <StoreFixturesPage canEdit />;
}
