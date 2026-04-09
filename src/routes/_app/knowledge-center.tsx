import { createFileRoute, redirect } from "@tanstack/react-router";

import type { BeforeLoadArgs } from "@/routes/__root";
import { requirePermission } from "@/routes/-guards/requirePermission";

export const Route = createFileRoute("/_app/knowledge-center")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    const user = requirePermission(context, "knowledge-center:view");

    if (user.role !== "checker" && user.role !== "admin") {
      throw redirect({ to: "/forbidden" });
    }

    throw redirect({ to: "/checker/knowledge-center" });
  },
});
