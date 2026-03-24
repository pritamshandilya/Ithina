import { AlertTriangle } from "lucide-react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { useCampaignHistory, useInsights, useStatCards } from "@/hooks/use-dashboard";

import CampaignHistoryTable from "./components/campaign-history-table";
import InsightsGrid from "./components/insights-grid";
import StatCardsGrid from "./components/stat-cards-grid";

export default function Dashboard() {
  const { data: cards = [], isLoading: cardsLoading, isError: cardsError } = useStatCards();
  const { data: insights = [], isLoading: insightsLoading } = useInsights();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaignHistory();

  const isLoading = cardsLoading || insightsLoading || campaignsLoading;
  const hasError = cardsError;

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
            <InsightsGrid insights={insights} />
            <CampaignHistoryTable campaigns={campaigns} />
          </>
        )}
    </div>
  );
}
