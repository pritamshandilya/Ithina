import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import ErrorBoundary from "@/components/shared/error-boundary";
import type { AuthProviderContext } from "@/providers/auth";

interface RouteContext {
  queryClient: QueryClient;
  auth: AuthProviderContext;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  ),
});
