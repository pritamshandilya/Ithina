import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "./-guards/requireAuth";
import type { BeforeLoadArgs } from "@/routes/__root";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }: BeforeLoadArgs) => {
    requireAuth(context, location);
  },
  component: () => <Outlet />,
});
