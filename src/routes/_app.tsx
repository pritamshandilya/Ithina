import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireAuth } from "./-guards/requireAuth";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ context, location }) => {
    requireAuth(context, location);
  },
  component: () => <Outlet />,
});
