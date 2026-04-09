import { createFileRoute } from "@tanstack/react-router";

import { AuditReviewWorkspace } from "@/routes/checker/review/$auditId/index";

export const Route = createFileRoute("/admin/$storeId/review/$auditId")({
  component: AuditReviewWorkspace,
});
