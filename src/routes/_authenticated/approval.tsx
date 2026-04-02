import { createFileRoute } from "@tanstack/react-router";

import Approval from "@/features/approval";
import { requireRole } from "@/routes/-guards/requireRole";

export const Route = createFileRoute("/_authenticated/approval")({
  beforeLoad: () => {
    requireRole(["checker", "admin"]);
  },
  component: Approval,
});
