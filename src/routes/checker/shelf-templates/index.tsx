import { createFileRoute } from "@tanstack/react-router";

import { ShelfTemplatesPage } from "@/components/shelf/ShelfTemplatesPage";

export const Route = createFileRoute("/checker/shelf-templates/")({
  component: ShelfTemplatesPage,
});
