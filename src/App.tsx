import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";

import { useAuth } from "./providers/auth";
import { routeTree } from "./routeTree.gen";
import { isSessionAuthenticated } from "@/lib/auth/session";
import { fetchCurrentUser } from "@/services/auth-api";
import { useAppDispatch } from "@/store/hooks";
import { clearSession, setAuthenticatedSession } from "@/store/slices/session-slice";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
    auth: undefined!,
  },
});

export default function App() {
  const auth = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === "true";
    if (skipAuth || !isSessionAuthenticated()) {
      return;
    }

    let isMounted = true;

    void (async () => {
      try {
        const user = await fetchCurrentUser();
        if (!isMounted) return;
        dispatch(
          setAuthenticatedSession({
            user: {
              email: user.email,
              firstName: user.first_name,
              lastName: user.last_name,
              role: user.role,
            },
            organization: user.organization,
          }),
        );
      } catch {
        if (!isMounted) return;
        dispatch(clearSession());
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />

      {Boolean(import.meta.env.VITE_DEBUG) && (
        <>
          <ReactQueryDevtools />

          <TanStackRouterDevtools router={router} />
        </>
      )}
    </QueryClientProvider>
  );
}
