import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";

export const Route = createFileRoute("/_app/knowledge-center")({
  beforeLoad: ({ context }) => {
    const user = requirePermission(context, "knowledge-center:view");

    if (user.role !== "checker") {
      throw redirect({ to: "/forbidden" });
    }

    throw redirect({ to: "/checker/knowledge-center" });
  },
});
