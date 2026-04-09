import { createFileRoute } from "@tanstack/react-router";
import { PlanogramAnalysisViewPage } from "@/routes/checker/shelf/$shelfId/analysis";

export const Route = createFileRoute("/admin/$storeId/shelf/$shelfId/analysis")({
  component: PlanogramAnalysisViewPage,
});
