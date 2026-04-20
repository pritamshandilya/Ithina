import { createFileRoute, useParams } from "@tanstack/react-router";

import { StoreFixtureDetailPage } from "@/components/checker/stores/store-fixture-detail-page";

export const Route = createFileRoute("/checker/fixture-types/$shelfId/")({
  component: CheckerFixtureShelfDetailRoute,
});

function CheckerFixtureShelfDetailRoute() {
  const { shelfId } = useParams({ strict: false }) as { shelfId: string };
  return (
    <StoreFixtureDetailPage
      shelfId={shelfId}
      fallbackPath="/checker/fixture-types"
    />
  );
}
