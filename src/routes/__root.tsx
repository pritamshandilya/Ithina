import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";

import type { AuthProviderContext } from "@/providers/auth";

interface RouteContext {
  queryClient: QueryClient;
  auth: AuthProviderContext;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  beforeLoad: async ({ context: { auth }, location: { pathname } }) => {
    const { isLoggedIn, startLogin } = auth;

    if (!isLoggedIn) {
      throw startLogin(pathname);
    }
  },
  component: () => {
    return <div>Protected Route</div>;
  },
});
