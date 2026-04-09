import { createFileRoute } from "@tanstack/react-router";
import { CheckerAuditReviewPage } from "@/routes/checker/audit-review/index";

export const Route = createFileRoute("/admin/$storeId/audit-review")({
  component: CheckerAuditReviewPage,
});
