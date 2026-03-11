import { Zap } from "lucide-react";

import InsightCard from "./insight-card";
import type { InsightCardData } from "@/types/dashboard";

const INSIGHTS: InsightCardData[] = [
  {
    id: "insight-1",
    severity: "time-sensitive",
    title: "12 Sushi Trays Expiring",
    description:
      "ROOS detects 12 SKUs in the Perishables category reaching expiration in 48 hours. Estimated waste value: $892.",
    timestamp: "Just Now",
    actionLabel: "Draft Clearance Campaign",
  },
  {
    id: "insight-2",
    severity: "velocity-drop",
    title: "Beverage Category -8%",
    description:
      "Sales velocity for summer beverages has dropped 8% week-over-week. Inventory is backing up.",
    actionLabel: "Draft Weekend Promo",
  },
  {
    id: "insight-3",
    severity: "high-stock",
    title: "Premium Electronics",
    description:
      "High stock levels detected on high-margin headphones. Suggestion: Bundle or Flash Sale.",
    actionLabel: "Draft Flash Sale",
  },
];

export default function InsightsGrid() {
  return (
    <div className="shrink-0">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Zap className="size-4 text-ithina-purple" />
        Proactive ROOS Insights
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {INSIGHTS.map((insight) => (
          <InsightCard key={insight.id} data={insight} />
        ))}
      </div>
    </div>
  );
}
