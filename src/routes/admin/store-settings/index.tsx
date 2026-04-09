import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/store-settings/")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/organization-settings" });
  },
});
