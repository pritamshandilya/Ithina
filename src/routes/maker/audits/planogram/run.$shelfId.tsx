/**
 * Planogram-based analysis run – same pipeline as adhoc (upload, analyze, report).
 * Accessed when clicking "+ New" in the planogram table for a shelf.
 */

import { createFileRoute } from "@tanstack/react-router";

import { AnalysisFlowPage } from "@/components/maker";

export const Route = createFileRoute("/maker/audits/planogram/run/$shelfId")({
  component: NewPlanogramAnalysisPage,
});

function NewPlanogramAnalysisPage() {
  return (
    <AnalysisFlowPage
      title="New Planogram Based Analysis"
      backTo="/maker/audits/planogram"
    />
  );
}
