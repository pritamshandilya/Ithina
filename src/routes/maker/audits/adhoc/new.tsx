import { createFileRoute, useLocation } from "@tanstack/react-router";

import { AnalysisFlowPage } from "@/components/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new")({
  component: NewAdhocAnalysisPage,
});

function NewAdhocAnalysisPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from;
  const backTo = from ?? "/maker/audits/adhoc";

  return (
    <AnalysisFlowPage
      title="New Adhoc Analysis"
      backTo={backTo}
    />
  );
}
