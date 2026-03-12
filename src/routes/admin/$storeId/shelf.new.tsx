import { createFileRoute } from "@tanstack/react-router";
import { AddPlanogramPage } from "@/routes/checker/shelf/new/index";
import { z } from "zod";

export const Route = createFileRoute("/admin/$storeId/shelf/new")({
  component: AddPlanogramPage,
  validateSearch: (search) =>
    z
      .object({
        associateShelfId: z.string().optional(),
        associateShelfName: z.string().optional(),
      })
      .parse(search),
});
