import { createFileRoute } from "@tanstack/react-router";
import { ShelfLevelReport } from "@/routes/checker/reports/shelf-level/index";

export const Route = createFileRoute("/admin/$storeId/reports/shelf-level")({
  component: ShelfLevelReport,
});
