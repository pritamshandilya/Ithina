import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/stores/")({
  beforeLoad: () => {
    throw redirect({ to: "/stores" });
  },
});
