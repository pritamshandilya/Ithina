/**
 * StockingRulesSection – lists high demand SKUs, restock threshold, notes
 */

import { FileText, Package, Zap } from "lucide-react";

import type { StockingRules } from "@/types/planogram";

export interface StockingRulesSectionProps {
  stockingRules?: StockingRules | null;
  className?: string;
}

export function StockingRulesSection({
  stockingRules,
  className,
}: StockingRulesSectionProps) {
  if (!stockingRules) {
    return (
      <div
        className={className}
        role="region"
        aria-label="Stocking rules"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">Stocking Rules</h3>
        <p className="text-sm text-muted-foreground">No stocking rules defined.</p>
      </div>
    );
  }

  const { highDemandProducts, restockThreshold, notes } = stockingRules;

  return (
    <div
      className={className}
      role="region"
      aria-label="Stocking rules"
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">Stocking Rules</h3>
      <ul className="space-y-2 text-sm">
        {highDemandProducts.length > 0 && (
          <li className="flex items-start gap-2 min-w-0">
            <Zap className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
            <span className="min-w-0 wrap-break-word">
              <strong className="text-foreground">High demand SKUs:</strong>{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs break-all">
                {highDemandProducts.join(", ")}
              </code>
            </span>
          </li>
        )}
        <li className="flex items-start gap-2 min-w-0">
          <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="min-w-0 wrap-break-word">
            <strong className="text-foreground">Restock threshold:</strong>{" "}
            {Math.round(restockThreshold * 100)}% of optimal level
          </span>
        </li>
        {notes && (
          <li className="flex items-start gap-2 min-w-0">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="min-w-0 wrap-break-word">
              <strong className="text-foreground">Notes:</strong> {notes}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}
