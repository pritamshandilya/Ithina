import { createFileRoute } from "@tanstack/react-router";

import { PlanogramsNewPage } from "@/components/planogram/PlanogramsNewPage";

export const Route = createFileRoute("/admin/$storeId/planograms/new")({
  component: PlanogramsNewPage,
});
