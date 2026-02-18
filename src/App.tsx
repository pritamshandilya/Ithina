import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { routeTree } from "./routeTree.gen";

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
      <RouterProvider router={router} />

      {Boolean(import.meta.env.VITE_DEBUG) && (
        <>
          <ReactQueryDevtools />

          <TanStackRouterDevtools router={router} />
        </>
      )}
    </QueryClientProvider>
  );
}
