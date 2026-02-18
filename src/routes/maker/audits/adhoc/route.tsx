import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/maker/audits/adhoc")({
  component: AdhocLayout,
});

function AdhocLayout() {
  return <Outlet />;
}
