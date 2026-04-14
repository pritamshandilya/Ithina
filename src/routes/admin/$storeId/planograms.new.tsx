import { createFileRoute } from "@tanstack/react-router";

import { PlanogramsNewPage } from "@/features/planogram-library/planograms-new-page";

export const Route = createFileRoute("/admin/$storeId/planograms/new")({
  component: PlanogramsNewPage,
});
