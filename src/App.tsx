import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/toaster";

import { promoQueryClient } from "@/lib/query-client";

import { useAuth } from "./providers/auth";
import { routeTree } from "./routeTree.gen";

/**
 * Hash routing stores the route in the URL fragment (#/wizard). The server only
 * needs to serve `/cbai/promo/index.html` once — refresh/deep links work without
 * nginx `try_files`. Set `VITE_USE_HASH_ROUTER=false` when the server sends all
 * SPA paths to index.html (clean URLs: /cbai/promo/wizard).
 */
function resolveRouterHistory() {
  const explicit = import.meta.env.VITE_USE_HASH_ROUTER;
  if (explicit === "false") return undefined;
  if (explicit === "true") return createHashHistory();
  if (import.meta.env.PROD) return createHashHistory();
  return undefined;
}

const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createRouter({
  routeTree,
  basepath,
  history: resolveRouterHistory(),
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient: promoQueryClient,
    auth: undefined!,
  },
});

export default function App() {
  const auth = useAuth();

  return (
    <QueryClientProvider client={promoQueryClient}>
      <RouterProvider router={router} context={{ auth }} />
      <Toaster />

      {Boolean(import.meta.env.VITE_DEBUG) && (
        <>
          <ReactQueryDevtools />

          <TanStackRouterDevtools router={router} />
        </>
      )}
    </QueryClientProvider>
  );
}
