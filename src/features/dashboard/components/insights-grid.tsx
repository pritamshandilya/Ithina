import { Zap } from "lucide-react";

import type { InsightCardData } from "@/types/dashboard";

import InsightCard from "./insight-card";

interface InsightsGridProps {
  insights: InsightCardData[];
}

export default function InsightsGrid({ insights }: InsightsGridProps) {
  return (
    <div className="shrink-0">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Zap className="size-4 text-ithina-purple" />
        Proactive ROOS Insights
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} data={insight} />
        ))}
      </div>
    </div>
  );
}
