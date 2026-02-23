/**
 * Planogram-based analysis run – same pipeline as adhoc (upload, analyze, report).
 * Accessed when clicking "+ New" in the planogram table for a shelf.
 */

import { createFileRoute, useLocation } from "@tanstack/react-router";

import { AnalysisFlowPage } from "@/components/maker";
import { MOCK_IMAGE_COMPARISON } from "@/features/maker/analysis";
import { usePlanogramShelfPreview } from "@/features/maker/hooks";

export const Route = createFileRoute("/maker/audits/planogram/run/$shelfId")({
  component: NewPlanogramAnalysisPage,
});

function NewPlanogramAnalysisPage() {
  const { shelfId } = Route.useParams();
  const location = useLocation();
  const { data: preview } = usePlanogramShelfPreview(shelfId);
  const from = (location.state as { from?: string } | undefined)?.from;
  const backTo = from ?? "/maker/audits/planogram";

  return (
    <AnalysisFlowPage
      title="New Planogram Based Analysis"
      backTo={backTo}
      shelfName={preview?.shelf.shelfName}
      planogramName={preview?.planogramPayload?.planogram?.name}
      planogramExpectedData={MOCK_IMAGE_COMPARISON}
    />
  );
}
