import { createFileRoute, redirect } from "@tanstack/react-router";

import { hasPermission } from "@/auth/authorization";
import type { BeforeLoadArgs } from "@/routes/__root";
import { requirePermission } from "@/routes/-guards/requirePermission";

export const Route = createFileRoute("/_app/stores")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    const user = requirePermission(context, "stores:read");

    if (hasPermission(user, "stores:manage")) {
      throw redirect({ to: "/admin/stores" });
    }

    throw redirect({ to: "/dashboard" });
  },
});
