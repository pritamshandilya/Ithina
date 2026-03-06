import { createFileRoute } from "@tanstack/react-router";

import MainLayout from "@/components/layouts/main";

/**
 * Layout wrapper for all Maker routes
 * This provides consistent layout structure for the maker dashboard and sub-routes
 */
export const Route = createFileRoute("/maker")({
  component: MakerLayout,
});

function MakerLayout() {
  return <MainLayout />;
}
