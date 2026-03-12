import type { StatCardData } from "@/types/dashboard";

import StatCard from "./stat-card";

interface StatCardsGridProps {
  cards: StatCardData[];
}

export default function StatCardsGrid({ cards }: StatCardsGridProps) {
  return (
    <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} data={card} />
      ))}
    </div>
  );
}
