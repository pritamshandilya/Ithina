import { createFileRoute, redirect } from "@tanstack/react-router";

import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "./-guards/requireAuth";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
    throw redirect({ to: "/dashboard" });
  },
});
