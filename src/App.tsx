import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { routeTree } from "./routeTree.gen";
import { StoreProvider } from "./providers/store";

const queryClient = new QueryClient();
const normalizedBasePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const router = createRouter({
  routeTree,
  basepath: normalizedBasePath,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <RouterProvider router={router} />
      </StoreProvider>

      {Boolean(import.meta.env.VITE_DEBUG) && (
        <>
          <ReactQueryDevtools />

          <TanStackRouterDevtools router={router} />
        </>
      )}
    </QueryClientProvider>
  );
}
