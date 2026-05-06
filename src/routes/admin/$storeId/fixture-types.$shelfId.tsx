import { createFileRoute, useParams } from "@tanstack/react-router";

import { StoreFixtureDetailPage } from "@/components/checker/stores/StoreFixtureDetailPage";

export const Route = createFileRoute("/admin/$storeId/fixture-types/$shelfId")({
  component: AdminFixtureShelfDetailRoute,
});

function AdminFixtureShelfDetailRoute() {
  const { shelfId, storeId } = useParams({ strict: false }) as {
    shelfId: string;
    storeId: string;
  };
  return (
    <StoreFixtureDetailPage
      shelfId={shelfId}
      storeId={storeId}
      isAdminPath
      fallbackPath={`/admin/${storeId}/fixture-types`}
    />
  );
}
