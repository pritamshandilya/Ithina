import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Layout route for My Audits modes.
 * Renders child routes: planogram, adhoc.
 */
export const Route = createFileRoute("/maker/audits")({
  component: MakerAuditsLayout,
});

function MakerAuditsLayout() {
  return <Outlet />;
}
