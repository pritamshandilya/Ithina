import { createFileRoute } from "@tanstack/react-router";

import { AuditReportPage } from "@/routes/checker/audit-report/$auditId/index";

export const Route = createFileRoute("/admin/$storeId/audit-report/$auditId")({
  component: AuditReportPage,
  meta: {
    layoutMode: "fullReport",
  },
});
