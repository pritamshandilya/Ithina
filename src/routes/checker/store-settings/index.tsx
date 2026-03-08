import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/checker/store-settings/")({
  beforeLoad: () => {
    throw redirect({ to: "/stores" });
  },
});
