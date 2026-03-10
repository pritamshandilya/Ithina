import { createFileRoute } from "@tanstack/react-router";
import { AdhocReport } from "@/routes/checker/reports/adhoc/index";

export const Route = createFileRoute("/admin/$storeId/reports/adhoc")({
  component: AdhocReport,
});
