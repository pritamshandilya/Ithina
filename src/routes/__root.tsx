import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toaster";

interface RouteContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  },
});
