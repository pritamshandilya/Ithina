import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/org-dashboard/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
