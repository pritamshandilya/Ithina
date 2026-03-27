import { createFileRoute } from "@tanstack/react-router";
import { NewAdhocAnalysisPage } from "@/routes/maker/audits/adhoc/new/index";

export const Route = createFileRoute("/admin/$storeId/audits/adhoc/new")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      shelfId: (search.shelfId as string) || undefined,
      from: (search.from as string) || undefined,
    };
  },
  component: NewAdhocAnalysisPage,
});
