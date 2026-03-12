import { createFileRoute } from "@tanstack/react-router";

import TemplateManager from "@/features/templates";

export const Route = createFileRoute("/_authenticated/templates")({
  component: TemplateManager,
});
