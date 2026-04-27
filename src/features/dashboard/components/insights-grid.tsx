import { Zap } from "lucide-react";
import { memo } from "react";

import type { InsightCardData } from "@/types/dashboard";

import InsightCard from "./insight-card";

interface InsightsGridProps {
  insights: InsightCardData[];
  onInsightAction?: (insight: InsightCardData) => void;
}

function InsightsGrid({ insights, onInsightAction }: InsightsGridProps) {
  return (
    <div className="shrink-0">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Zap className="size-4 text-ithina-purple" />
        Proactive ROOS Insights
      </h2>
      {insights.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ithina-border bg-ithina-panel/50 px-4 py-6 text-sm text-slate-500">
          No insights for this store yet. When ROOS data is available from the backend, suggestions will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {insights.map((insight) => (
            <InsightCard
              key={insight.id}
              data={insight}
              onAction={
                onInsightAction ? () => onInsightAction(insight) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(InsightsGrid);
