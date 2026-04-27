/**
 * Placeholder “Proactive ROOS Insights” cards for the store dashboard.
 * Replace with `useQuery` + a real endpoint when the ROOS insights API ships.
 */
export type MockRoosInsight = {
  id: string;
  label: string;
  barClass: string;
  badgeClass: string;
  hoverBorderClass: string;
  timestamp: string | null;
  title: string;
  description: string;
  actionLabel: string;
};

export const MOCK_ROOS_INSIGHTS: MockRoosInsight[] = [
  {
    id: "ins-1",
    label: "Time Sensitive",
    barClass: "bg-amber-500/50",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    hoverBorderClass: "hover:border-amber-500/50",
    timestamp: "Just Now",
    title: "12 Sushi Trays Expiring",
    description:
      "ROOS detects 12 SKUs in the Perishables category reaching expiration in 48 hours. Estimated waste value: $892.",
    actionLabel: "Draft Clearance Campaign",
  },
  {
    id: "ins-2",
    label: "Velocity Drop",
    barClass: "bg-rose-500/50",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    hoverBorderClass: "hover:border-white/20",
    timestamp: null,
    title: "Beverage Category −8%",
    description:
      "Sales velocity for summer beverages has dropped 8% week-over-week. Inventory is backing up.",
    actionLabel: "Draft Weekend Promo",
  },
  {
    id: "ins-3",
    label: "High Stock",
    barClass: "bg-emerald-500/50",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    hoverBorderClass: "hover:border-white/20",
    timestamp: null,
    title: "Premium Electronics",
    description:
      "High stock levels detected on high-margin headphones. Suggestion: Bundle or Flash Sale.",
    actionLabel: "Draft Flash Sale",
  },
];
