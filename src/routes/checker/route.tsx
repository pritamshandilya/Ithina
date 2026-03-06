/**
 * Checker Layout
 * 
 * Base layout for all checker-specific routes.
 * Wraps routes with MainLayout and applies consistent background styling.
 */

import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main";

export const Route = createFileRoute("/checker")({
  component: CheckerLayout,
});

function CheckerLayout() {
  return <MainLayout />;
}
