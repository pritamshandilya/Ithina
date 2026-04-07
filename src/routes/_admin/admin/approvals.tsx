import { createFileRoute } from "@tanstack/react-router";

import Approval from "@/features/approval";

export const Route = createFileRoute("/_admin/admin/approvals")({
  component: Approval,
});
