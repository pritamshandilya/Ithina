import { createFileRoute } from "@tanstack/react-router";

import { ShelfTemplatesPage } from "@/features/shelf/ShelfTemplatesPage";

export const Route = createFileRoute("/admin/$storeId/shelf-templates")({
  component: ShelfTemplatesPage,
});

