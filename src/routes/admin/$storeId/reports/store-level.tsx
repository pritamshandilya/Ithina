import { createFileRoute } from "@tanstack/react-router";
import { StoreLevelReport } from "@/routes/checker/reports/store-level/index";

export const Route = createFileRoute("/admin/$storeId/reports/store-level")({
  component: StoreLevelReport,
});
