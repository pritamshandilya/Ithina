import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/maker/audits/planogram")({
  component: PlanogramLayout,
});

function PlanogramLayout() {
  return <Outlet />;
}
