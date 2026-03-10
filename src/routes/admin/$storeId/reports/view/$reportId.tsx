import { createFileRoute } from "@tanstack/react-router";
import { DetailedReportPage } from "@/routes/checker/reports/view/$reportId/index";

export const Route = createFileRoute("/admin/$storeId/reports/view/$reportId")({
  component: DetailedReportPage,
});
