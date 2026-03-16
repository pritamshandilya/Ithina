import { Outlet, createFileRoute } from "@tanstack/react-router";

import type { BeforeLoadArgs } from "@/routes/__root";
import { requireAuth } from "./-guards/requireAuth";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
  },
  component: () => <Outlet />,
});
