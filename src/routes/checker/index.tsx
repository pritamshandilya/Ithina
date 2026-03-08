import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/")({
  beforeLoad: () => {
    throw redirect({ to: "/checker/dashboard" });
  },
});
