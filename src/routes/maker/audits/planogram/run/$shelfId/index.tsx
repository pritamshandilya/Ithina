/**
 * Planogram-based analysis run – same pipeline as adhoc (upload, analyze, report).
 * Accessed when clicking "+ New" in the planogram table for a shelf.
 */

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { getEffectiveFixturePlanogramId } from "@/lib/fixtures/fixture-planogram-association";
import { useStore } from "@/providers/store";
import { usePlanogramById, usePlanogramShelfPreview, useStoreFixtures } from "@/queries/maker";

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
  const { selectedStore } = useStore();
  const { data: preview } = usePlanogramShelfPreview(shelfId);
  const { data: fixtures = [] } = useStoreFixtures();
  const backTo = from ?? "/maker/audits/planogram";
  const fixtureId = preview?.shelf.fixtureId ?? null;
  const fixture = fixtures.find((item) => item.id === fixtureId) ?? null;
  const effectivePlanogramId = fixtureId
    ? getEffectiveFixturePlanogramId({
        storeId: selectedStore?.id,
        fixtureId,
        serverPlanogramId:
          fixture?.planogram_id ??
          preview?.shelf.planogramId ??
          preview?.planogramPayload?.planogram.id ??
          null,
      })
    : (preview?.shelf.planogramId ?? preview?.planogramPayload?.planogram.id ?? null);
  const { data: associatedPlanogramPayload } = usePlanogramById(effectivePlanogramId);
  const analysisPlanogramPayload =
    associatedPlanogramPayload ?? preview?.planogramPayload ?? null;

  return (
    <AnalysisFlowPage
      title="New Planogram Based Analysis"
      backTo={backTo}
      shelfName={preview?.shelf.shelfName}
      planogramName={analysisPlanogramPayload?.planogram?.name}
      planogramPayload={analysisPlanogramPayload}
      fixedFixtureId={fixtureId ?? undefined}
      fixedPlanogramId={effectivePlanogramId ?? undefined}
    />
  );
}
