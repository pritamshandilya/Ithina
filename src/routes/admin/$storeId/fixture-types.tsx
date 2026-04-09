import { createFileRoute } from "@tanstack/react-router";

import { StoreFixturesPage } from "@/components/checker/stores/StoreFixturesPage";

export const Route = createFileRoute("/admin/$storeId/fixture-types")({
  component: () => <StoreFixturesPage canEdit />,
});
