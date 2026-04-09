import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/shelf")({
  component: PlanogramLayout,
});

function PlanogramLayout() {
  return <Outlet />;
}
