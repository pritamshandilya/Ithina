import { createFileRoute } from "@tanstack/react-router";

import { StoreFixturesPage } from "@/components/checker/stores/StoreFixturesPage";

export const Route = createFileRoute("/checker/fixture-types/")({
  component: CheckerFixtureTypesRoute,
});

function CheckerFixtureTypesRoute() {
  return <StoreFixturesPage />;
}
