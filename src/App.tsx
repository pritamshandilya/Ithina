import { useEffect, useSyncExternalStore } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { RouterAuthState } from "./auth/state";
import { AuthSessionService } from "./lib/auth/session";
import { useStore } from "./providers/store";
import { queryClient } from "./queries/client";
import { routeTree } from "./routeTree.gen";

const normalizedBasePath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

const ready = () => Promise.resolve();

const router = createRouter({
  routeTree,
  basepath: normalizedBasePath,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
    auth: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function useRouterAuthState(): RouterAuthState {
  const snapshot = useSyncExternalStore(
    (onStoreChange) => AuthSessionService.subscribe(onStoreChange),
    () => AuthSessionService.getSnapshot(),
    () => AuthSessionService.getSnapshot(),
  );

  return {
    status: "ready",
    isAuthenticated: snapshot.isAuthenticated,
    user: snapshot.user,
    ready,
  };
}

export default function App() {
  const auth = useRouterAuthState();
  const { selectedStore } = useStore();
  const authUserId = auth.user?.id ?? null;
  const authUserRole = auth.user?.role ?? null;
  const permissionFingerprint = auth.user?.permissions?.join("|") ?? "";
  const selectedStoreId = selectedStore?.id ?? null;

  useEffect(() => {
    router.invalidate();
  }, [auth.isAuthenticated, authUserId, authUserRole, permissionFingerprint]);

  useEffect(() => {
    router.invalidate();
    queryClient.invalidateQueries({
      predicate: ({ queryKey }) => {
        const scope = queryKey[0];
        return (
          scope === "maker" ||
          scope === "checker" ||
          scope === "compliance-rule-sets" ||
          scope === "planograms"
        );
      },
    });
  }, [selectedStoreId]);

  return (
    <>
      <RouterProvider
        router={router}
        context={{
          queryClient,
          auth,
        }}
      />
      {Boolean(import.meta.env.VITE_DEBUG) && (
        <>
          <ReactQueryDevtools />

          <TanStackRouterDevtools router={router} />
        </>
      )}
    </>
  );
}
