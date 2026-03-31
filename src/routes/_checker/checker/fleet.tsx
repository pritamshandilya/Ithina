import { createFileRoute } from "@tanstack/react-router";

import Fleet from "@/features/fleet";

export const Route = createFileRoute("/_checker/checker/fleet")({
  component: Fleet,
});
