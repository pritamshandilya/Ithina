import { createFileRoute } from "@tanstack/react-router";
import { PlanogramAnalysisPage } from "@/routes/checker/shelf/index";

export const Route = createFileRoute("/admin/$storeId/shelf/")({
  component: PlanogramAnalysisPage,
  meta: {
    layoutMode: "stickyTable",
  },
});
