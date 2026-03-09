import { createFileRoute, redirect } from "@tanstack/react-router";

import { requireAuth } from "./-guards/requireAuth";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context, location }) => {
    requireAuth(context, location);
    throw redirect({ to: "/dashboard" });
  },
});
