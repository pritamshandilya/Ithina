import { createFileRoute, Outlet } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";

/**
 * Layout wrapper for all Maker routes
 * This provides consistent layout structure for the maker dashboard and sub-routes
 */
export const Route = createFileRoute("/maker/_layout")({
  component: MakerLayout,
});

function MakerLayout() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-primary">
        <Outlet />
      </div>
    </MainLayout>
  );
}
