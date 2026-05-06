export interface StockingRulesSectionProps {
  className?: string;
}

export function StockingRulesSection({ className }: StockingRulesSectionProps) {
  return (
    <div className={className} role="region" aria-label="Planogram notes">
      <h3 className="text-foreground mb-3 text-sm font-semibold">
        Planogram notes
      </h3>
      <p className="text-muted-foreground text-sm">
        This schema revision does not include stocking rules metadata.
      </p>
    </div>
  );
}
