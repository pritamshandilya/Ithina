import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/org-staff/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
