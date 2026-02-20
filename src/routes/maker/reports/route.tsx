import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Maker Reports layout – provides outlet for nested report views
 */
export const Route = createFileRoute("/maker/reports")({
  component: MakerReportsLayout,
});

function MakerReportsLayout() {
  return <Outlet />;
}
