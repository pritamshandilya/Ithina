/**
 * Imperative router bridge so non-React code (Axios interceptors, service
 * modules) can trigger SPA navigations without holding a React context.
 *
 * Call `bindAppRouter(router)` once after `createRouter()` in App.tsx.
 */

type MinimalRouter = {
  navigate: (opts: { to: string; replace?: boolean }) => Promise<void>;
};

let routerRef: MinimalRouter | undefined;

export function bindAppRouter(router: MinimalRouter): void {
  routerRef = router;
}

export function navigateToLogin(): void {
  if (routerRef) {
    void routerRef.navigate({ to: "/login", replace: true });
  } else {
    window.location.href = "/login";
  }
}
