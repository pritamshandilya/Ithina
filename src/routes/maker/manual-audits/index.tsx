import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { ManualOverrideList, type ApprovalAction } from "@/components/maker";
import { useHistoricalAnalyses } from "@/queries/maker";

export const Route = createFileRoute("/maker/manual-audits/")({
  component: MakerManualAuditsPage,
});

function MakerManualAuditsPage() {
  const navigate = useNavigate();
  const { data: historicalAnalyses } = useHistoricalAnalyses();

  const adhocAnalyses = useMemo(
    () => historicalAnalyses.filter((row) => row.type === "adhoc"),
    [historicalAnalyses]
  );

  const resolveAdhocAnalysisId = (
    explicitAnalysisId: string | undefined,
    shelfId: string,
    submittedAt?: Date
  ): string | null => {
    if (explicitAnalysisId) return explicitAnalysisId;
    if (adhocAnalyses.length === 0) return null;

    const shelfMatches = adhocAnalyses.filter((row) => row.shelfId === shelfId);
    const candidates = shelfMatches.length > 0 ? shelfMatches : adhocAnalyses;

    if (!submittedAt) return candidates[0]?.id ?? null;

    const submittedMs = new Date(submittedAt).getTime();
    let best = candidates[0];
    let bestDelta = Math.abs(best.runDate.getTime() - submittedMs);
    for (const row of candidates.slice(1)) {
      const delta = Math.abs(row.runDate.getTime() - submittedMs);
      if (delta < bestDelta) {
        best = row;
        bestDelta = delta;
      }
    }
    return best?.id ?? null;
  };

  const handleAction = (
    auditId: string,
    shelfId: string,
    action: ApprovalAction,
    mode?: string,
    adhocAnalysisId?: string,
    submittedAt?: Date
  ) => {
    const isPlanogram = mode === "planogram-based" || mode === "vision-edge";
    void auditId;

    if (action === "fix") {
      if (isPlanogram) {
        navigate({
          to: "/maker/audits/planogram/run/$shelfId",
          params: { shelfId },
        });
      } else {
        navigate({
          to: "/maker/audits/adhoc/new",
          search: { shelfId },
        });
      }
    } else if (action === "view-report" || action === "view-details") {
      if (isPlanogram) {
        navigate({
          to: "/maker/audits/planogram/$shelfId",
          params: { shelfId },
        });
      } else {
        const resolvedAnalysisId = resolveAdhocAnalysisId(adhocAnalysisId, shelfId, submittedAt);
        if (!resolvedAnalysisId) {
          navigate({
            to: "/maker/historical-analysis",
          });
          return;
        }
        navigate({
          to: "/maker/historical-analysis/$analysisId",
          params: { analysisId: resolvedAnalysisId },
          search: { type: "adhoc" },
        });
      }
    }
  };

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Approvals"
          description="Track the approval status of your submitted audits"
        />
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-primary pt-2 px-2 pb-4 sm:pt-3 sm:px-2 sm:pb-4 lg:pt-4 lg:px-2 lg:pb-5">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col min-h-0">
          <ManualOverrideList className="mt-3 flex-1 min-h-0" onAction={handleAction} />
        </div>
      </div>
    </MainLayout>
  );
}
