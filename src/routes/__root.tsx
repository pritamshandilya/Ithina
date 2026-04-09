import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import type { RouterAuthState } from "@/auth/state";
import { Toaster } from "@/components/ui/toaster";

import { SidebarProvider } from "@/components/ui/sidebar";

export interface AppRouterContext {
  queryClient: QueryClient;
  auth: RouterAuthState;
}

export interface BeforeLoadArgs {
  context: AppRouterContext;
  location?: { href?: string };
}

export const Route = createRootRouteWithContext<AppRouterContext>()({
  component: () => {
    return (
      <SidebarProvider defaultOpen={true}>
        <Outlet />
        <Toaster />
      </SidebarProvider>
    );
  },
});
