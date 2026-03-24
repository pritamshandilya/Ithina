import { createFileRoute } from "@tanstack/react-router";
import { AddPlanogramPage } from "@/routes/checker/shelf/new/index";
import { z } from "zod";

export const Route = createFileRoute("/admin/$storeId/shelf/new")({
  component: AdminShelfNewRouteComponent,
  validateSearch: (search: unknown) =>
    z
      .object({
        associateShelfId: z.string().optional(),
        associateShelfName: z.string().optional(),
        templateId: z.string().optional(),
        addMode: z.enum(["manual", "template"]).optional(),
      })
      .parse(search),
});

function AdminShelfNewRouteComponent() {
  const search = Route.useSearch();

  return <AddPlanogramPage searchOverride={search} />;
}
