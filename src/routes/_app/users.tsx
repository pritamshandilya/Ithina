import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";

export const Route = createFileRoute("/_app/users")({
  beforeLoad: ({ context }) => {
    requirePermission(context, "users:manage");
    throw redirect({ to: "/admin/users" });
  },
});
