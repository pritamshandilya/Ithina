import { createFileRoute } from "@tanstack/react-router";

import { PlanogramDetailPage } from "@/components/planogram/PlanogramDetailPage";

export const Route = createFileRoute("/admin/$storeId/planograms/$planogramId")(
  {
    component: PlanogramDetailPage,
  },
);
