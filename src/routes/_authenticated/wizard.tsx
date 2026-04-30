import { createFileRoute } from "@tanstack/react-router";

import Wizard from "@/features/wizard";

export const Route = createFileRoute("/_authenticated/wizard")({
  validateSearch: (search: Record<string, unknown>) => ({
    resumeId: typeof search.resumeId === "string" ? search.resumeId : undefined,
  }),
  component: Wizard,
});
