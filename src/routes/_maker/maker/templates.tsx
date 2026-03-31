import { createFileRoute } from "@tanstack/react-router";

import TemplateManager from "@/features/templates";

export const Route = createFileRoute("/_maker/maker/templates")({
  component: TemplateManager,
});
