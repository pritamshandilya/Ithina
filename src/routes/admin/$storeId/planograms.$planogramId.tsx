import { createFileRoute } from "@tanstack/react-router";

import { PlanogramDetailPage } from "@/features/planogram-library/planogram-detail-page";

export const Route = createFileRoute("/admin/$storeId/planograms/$planogramId")({
  component: PlanogramDetailPage,
});
