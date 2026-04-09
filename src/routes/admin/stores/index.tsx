import { createFileRoute } from "@tanstack/react-router";

import { StoresPage } from "@/components/checker/stores/StoresPage";

export const Route = createFileRoute("/admin/stores/")({
  component: StoresRoute,
});

function StoresRoute() {
  return <StoresPage />;
}
