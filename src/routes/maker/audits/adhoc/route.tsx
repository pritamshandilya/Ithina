import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/maker/audits/adhoc")({
  component: AdhocLayout,
});

function AdhocLayout() {
  return <Outlet />;
}
