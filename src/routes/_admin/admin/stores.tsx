import { createFileRoute } from "@tanstack/react-router";

import AdminStoresPage from "@/features/admin-stores";

export const Route = createFileRoute("/_admin/admin/stores")({
  component: AdminStoresPage,
});
