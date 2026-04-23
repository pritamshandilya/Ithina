export interface StockingRulesSectionProps {
  className?: string;
}

export function StockingRulesSection({
  className,
}: StockingRulesSectionProps) {
  return (
    <div className={className} role="region" aria-label="Planogram notes">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Planogram notes</h3>
      <p className="text-sm text-muted-foreground">
        This schema revision does not include stocking rules metadata.
      </p>
    </div>
  );
}
