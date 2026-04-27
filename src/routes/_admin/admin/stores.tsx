import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout route for `/admin/stores/*`. Renders child routes (list index, create wizard).
 * Without `<Outlet />`, `/admin/stores/new` incorrectly showed the list page component.
 */
export const Route = createFileRoute("/_admin/admin/stores")({
  component: AdminStoresLayout,
});

function AdminStoresLayout() {
  return <Outlet />;
}
