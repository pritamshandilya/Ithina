import { createFileRoute } from "@tanstack/react-router";

import { AnalysisFlowPage } from "@/components/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new")({
  component: NewAdhocAnalysisPage,
});

function NewAdhocAnalysisPage() {
  return (
    <AnalysisFlowPage
      title="New Adhoc Analysis"
      backTo="/maker/audits/adhoc"
    />
  );
}
