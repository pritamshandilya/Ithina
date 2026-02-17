import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * My Audits index - redirects to Planogram based analysis by default.
 */
export const Route = createFileRoute("/maker/audits/")({
  beforeLoad: () => {
    throw redirect({ to: "/maker/audits/planogram" });
  },
});
