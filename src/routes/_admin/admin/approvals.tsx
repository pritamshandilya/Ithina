import { createFileRoute } from "@tanstack/react-router";

import Approval from "@/features/approval";
import { assertAdminStoreRoute } from "@/lib/admin-route-guards";

export const Route = createFileRoute("/_admin/admin/approvals")({
  beforeLoad: () => {
    assertAdminStoreRoute();
  },
  component: Approval,
});
