import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/_app/users")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    requirePermission(context, "users:manage");
    throw redirect({ to: "/admin/users" });
  },
});
