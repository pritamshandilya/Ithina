import { createFileRoute } from "@tanstack/react-router";
import { KnowledgeCenterPage } from "@/routes/checker/knowledge-center/index";

export const Route = createFileRoute("/admin/$storeId/knowledge-center")({
  component: KnowledgeCenterPage,
});
