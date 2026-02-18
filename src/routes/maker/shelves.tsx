import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/maker/shelves")({
  component: ShelvesLayout,
});

function ShelvesLayout() {
  return <Outlet />;
}
