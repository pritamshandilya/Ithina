import { createFileRoute } from "@tanstack/react-router";

import Approval from "@/features/approval";

export const Route = createFileRoute("/_checker/checker/approvals")({
  component: Approval,
});
