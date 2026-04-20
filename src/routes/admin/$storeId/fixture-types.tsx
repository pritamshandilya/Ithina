import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/$storeId/fixture-types")({
  component: AdminFixtureTypesLayoutRoute,
});

function AdminFixtureTypesLayoutRoute() {
  return <Outlet />;
}
