import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Maker Historical Analysis layout – provides outlet for list and detail views
 */
export const Route = createFileRoute("/maker/historical-analysis")({
  component: HistoricalAnalysisLayout,
});

function HistoricalAnalysisLayout() {
  return <Outlet />;
}
