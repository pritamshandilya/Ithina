import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { useCampaignList } from "@/hooks/use-campaigns";
import { buildCampaignHistoryRows, buildDashboardStatCards } from "@/services/dashboard";
import { useAppDispatch } from "@/store/hooks";
import { setCampaignName } from "@/store/slices/campaign-slice";
import type { InsightCardData } from "@/types/dashboard";

import CampaignHistoryTable from "./components/campaign-history-table";
import InsightsGrid from "./components/insights-grid";
import StatCardsGrid from "./components/stat-cards-grid";

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: campaigns = [], isLoading, isError: hasError } = useCampaignList();

  const cards = useMemo(() => buildDashboardStatCards(campaigns), [campaigns]);
  const historyRows = useMemo(() => buildCampaignHistoryRows(campaigns), [campaigns]);
  /** Proactive ROOS insights — wired when a backend feed exists. */
  const insights: InsightCardData[] = [];

  const handleInsightAction = (insight: InsightCardData) => {
    dispatch(setCampaignName(insight.actionLabel));
    navigate({ to: "/wizard" });
  };

  if (hasError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <AlertTriangle className="size-10 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Failed to load dashboard</h3>
        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-6 lg:p-8">
        {isLoading ? (
          <LoadingSpinner label="Loading dashboard..." className="flex-1" />
        ) : (
          <>
            <StatCardsGrid cards={cards} />
            <InsightsGrid insights={insights} onInsightAction={handleInsightAction} />
            <CampaignHistoryTable campaigns={historyRows} />
          </>
        )}
    </div>
  );
}
