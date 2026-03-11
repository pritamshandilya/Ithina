import StatCard from "./stat-card";
import type { StatCardData } from "@/types/dashboard";

const STAT_CARDS: StatCardData[] = [
  {
    label: "Active Campaigns",
    value: "12",
    trend: { text: "+2 This Week", variant: "success" },
  },
  {
    label: "Pending Approvals",
    value: "3",
    trend: { text: "Requires Action", variant: "warning" },
  },
  {
    label: "Hardware Health",
    value: "99.8%",
    trend: { text: "Online", variant: "success" },
  },
  {
    label: "Est. Revenue Impact",
    value: "+$14k",
    trend: { text: "This Month", variant: "purple" },
  },
];

export default function StatCardsGrid() {
  return (
    <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-4">
      {STAT_CARDS.map((card) => (
        <StatCard key={card.label} data={card} />
      ))}
    </div>
  );
}
