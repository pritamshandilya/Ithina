import { createFileRoute } from "@tanstack/react-router";

import Fleet from "@/features/fleet";

export const Route = createFileRoute("/_admin/admin/fleet")({
  component: Fleet,
});
