/**
 * Planogram-based analysis run – same pipeline as adhoc (upload, analyze, report).
 * Accessed when clicking "+ New" in the planogram table for a shelf.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { MOCK_IMAGE_COMPARISON } from "@/lib/analysis";
import { usePlanogramShelfPreview } from "@/queries/maker";

export const Route = createFileRoute("/maker/audits/planogram/run/$shelfId/")({
  component: NewPlanogramAnalysisPage,
  validateSearch: (search: unknown) =>
    z
      .object({
        from: z.string().optional(),
      })
      .parse(search),
});

function NewPlanogramAnalysisPage() {
  const { shelfId } = Route.useParams();
  const { from } = Route.useSearch();
  const { data: preview } = usePlanogramShelfPreview(shelfId);
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
