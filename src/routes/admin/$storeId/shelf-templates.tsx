import { createFileRoute } from "@tanstack/react-router";

import { ShelfTemplatesPage } from "@/components/shelf/ShelfTemplatesPage";

export const Route = createFileRoute("/admin/$storeId/shelf-templates")({
  component: ShelfTemplatesPage,
});
