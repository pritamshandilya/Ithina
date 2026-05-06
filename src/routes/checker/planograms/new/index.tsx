import { createFileRoute } from "@tanstack/react-router";

import { PlanogramsNewPage } from "@/components/planogram/PlanogramsNewPage";

export const Route = createFileRoute("/checker/planograms/new/")({
  component: PlanogramsNewPage,
});
