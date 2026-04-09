import { createFileRoute } from "@tanstack/react-router";
import { ShelfDetailPage } from "@/routes/checker/shelf/$shelfId/index";

export const Route = createFileRoute("/admin/$storeId/shelf/$shelfId")({
  component: ShelfDetailPage,
});
