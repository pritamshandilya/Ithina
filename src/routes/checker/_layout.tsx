/**
 * Checker Layout
 * 
 * Base layout for all checker-specific routes.
 * Wraps routes with MainLayout and applies consistent background styling.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";

export const Route = createFileRoute("/checker/_layout")({
  component: CheckerLayout,
});

function CheckerLayout() {
  return (
    <MainLayout>
      {/* Use primary background for consistency with maker */}
      <div className="min-h-screen bg-primary">
        <Outlet />
      </div>
    </MainLayout>
  );
}
