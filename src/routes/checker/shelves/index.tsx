import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Checker Shelves - redirects to the shelf list (planogram analysis).
 */
export const Route = createFileRoute("/checker/shelves/")({
  beforeLoad: () => {
    throw redirect({ to: "/checker/shelf" });
  },
});
