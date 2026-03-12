import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import ErrorBoundary from "@/components/shared/error-boundary";

interface RouteContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
});
