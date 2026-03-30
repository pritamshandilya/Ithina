import { createFileRoute } from "@tanstack/react-router";

import Studio from "@/features/studio";

export const Route = createFileRoute("/_authenticated/studio")({
  component: Studio,
});
