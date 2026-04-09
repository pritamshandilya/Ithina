import { createFileRoute, redirect } from "@tanstack/react-router";

import type { BeforeLoadArgs } from "@/routes/__root";
import { requirePermission } from "@/routes/-guards/requirePermission";

export const Route = createFileRoute("/_app/users")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    requirePermission(context, "users:manage");
    throw redirect({ to: "/admin/users" });
  },
});
