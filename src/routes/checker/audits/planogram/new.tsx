import { createFileRoute } from "@tanstack/react-router";
import { AddPOGAnalysisPage } from "@/routes/maker/audits/planogram/new/index";

export const Route = createFileRoute("/checker/audits/planogram/new")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      shelfId: (search.shelfId as string) || undefined,
    };
  },
  component: CheckerPOGAnalysisRouteComponent,
});

function CheckerPOGAnalysisRouteComponent() {
  const search = Route.useSearch();
  return <AddPOGAnalysisPage searchOverride={search} />;
}
