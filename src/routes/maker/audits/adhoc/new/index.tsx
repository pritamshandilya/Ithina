import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { useAssignedShelves } from "@/queries/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new/")({
  component: NewAdhocAnalysisPage,
});

function NewAdhocAnalysisPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from;
  const backTo = from ?? "/maker/audits/adhoc";
  
  const { data: shelves } = useAssignedShelves();
  const [selectedShelfId, setSelectedShelfId] = useState<string>("");

  return (
    <AnalysisFlowPage
      title="New Adhoc Analysis"
      backTo={backTo}
      showShelfSelection
      selectedShelfId={selectedShelfId}
      onShelfSelect={setSelectedShelfId}
      shelves={shelves}
    />
  );
}
