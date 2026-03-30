import { createFileRoute } from "@tanstack/react-router";

import Wizard from "@/features/wizard";

export const Route = createFileRoute("/_authenticated/wizard")({
  component: Wizard,
});
