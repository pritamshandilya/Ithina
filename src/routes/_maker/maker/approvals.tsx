import { createFileRoute } from "@tanstack/react-router";

import Approval from "@/features/approval";

export const Route = createFileRoute("/_maker/maker/approvals")({
  component: Approval,
});
