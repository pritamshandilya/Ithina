import { createFileRoute, redirect } from "@tanstack/react-router";

import { requireAuth } from "./-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
    throw redirect({ to: "/dashboard" });
  },
});
