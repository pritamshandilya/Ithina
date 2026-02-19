/**
 * Planogram-based analysis run – same pipeline as adhoc (upload, analyze, report).
 * Accessed when clicking "+ New" in the planogram table for a shelf.
 */

import { createFileRoute } from "@tanstack/react-router";

import { AnalysisFlowPage, PlanogramPreview } from "@/components/maker";
import { usePlanogramShelfPreview } from "@/features/maker/hooks";

export const Route = createFileRoute("/maker/audits/planogram/run/$shelfId")({
  component: NewPlanogramAnalysisPage,
});

function NewPlanogramAnalysisPage() {
  const { shelfId } = Route.useParams();
  const { data: preview } = usePlanogramShelfPreview(shelfId);

  return (
    <AnalysisFlowPage
      title="New Planogram Based Analysis"
      backTo="/maker/audits/planogram"
      shelfName={preview?.shelf.shelfName}
      planogramName={preview?.planogramPayload?.planogram?.name}
      expectedLayoutPreview={
        preview?.shelf.planogramId ? (
          <PlanogramPreview planogramId={preview.shelf.planogramId} />
        ) : undefined
      }
    />
  );
}
