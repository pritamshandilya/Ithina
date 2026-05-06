import { createFileRoute, redirect } from "@tanstack/react-router";

import { requirePermission } from "@/routes/-guards/requirePermission";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/_app/knowledge-center")({
  beforeLoad: ({ context }: BeforeLoadArgs) => {
    const user = requirePermission(context, "knowledge-center:view");

    if (user.role !== "checker" && user.role !== "admin") {
      throw redirect({ to: "/forbidden" });
    }

    throw redirect({ to: "/checker/knowledge-center" });
  },
});
