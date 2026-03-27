import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState } from "react";

import { AnalysisFlowPage } from "@/components/maker/analysis-flow-page";
import { useShelves } from "@/queries/maker";

export const Route = createFileRoute("/maker/audits/adhoc/new/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      shelfId: (search.shelfId as string) || undefined,
      from: (search.from as string) || undefined,
    };
  },
  component: NewAdhocAnalysisPage,
});

function defaultBackPathForAdhocNew(pathname: string): string {
  const marker = "/audits/adhoc/new";
  const i = pathname.indexOf(marker);
  if (i >= 0 && pathname.includes("/admin/")) {
    return `${pathname.slice(0, i)}/shelf`;
  }
  return "/maker/audits/adhoc";
}

export function NewAdhocAnalysisPage() {
  const location = useLocation();
  const search = (location.search ?? {}) as {
    shelfId?: string;
    from?: string;
  };
  const shelfId = search.shelfId;
  const fromState = (location.state as { from?: string } | undefined)?.from;
  const backTo =
    search.from ?? fromState ?? defaultBackPathForAdhocNew(location.pathname);

  const { data: shelves } = useShelves();
  const [selectedShelfId, setSelectedShelfId] = useState<string>(shelfId || "");
  const isShelfLocked = !!shelfId;

  return (
    <AnalysisFlowPage
      title="New Adhoc Analysis"
      backTo={backTo}
      showShelfSelection
      selectedShelfId={selectedShelfId}
      onShelfSelect={setSelectedShelfId}
      shelves={shelves}
      isShelfSelectionLocked={isShelfLocked}
    />
  );
}
