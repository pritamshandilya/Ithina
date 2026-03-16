import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { useShelves } from "@/queries/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      shelfId: (search.shelfId as string) || undefined,
    };
  },
  component: NewAdhocAnalysisPage,
});

export function NewAdhocAnalysisPage() {
  const location = useLocation();
  const { shelfId } = Route.useSearch();
  const from = (location.state as { from?: string } | undefined)?.from;
  const backTo = from ?? "/maker/audits/adhoc";
  
  const { data: shelves } = useShelves();
  const [selectedShelfId, setSelectedShelfId] = useState<string>(shelfId || "");

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
