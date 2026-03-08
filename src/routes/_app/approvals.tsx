import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import { requireAuth } from "@/routes/-guards/requireAuth";

export const Route = createFileRoute("/_app/approvals")({
  beforeLoad: ({ context, location }) => {
    const user = requireAuth(context, location);

    if (hasPermission(user, "approvals:submit")) {
      throw redirect({ to: "/maker/manual-audits" });
    }

    if (hasPermission(user, "approvals:review")) {
      throw redirect({ to: "/checker/audit-review" });
    }

    throw redirect({ to: "/forbidden" });
  },
});
