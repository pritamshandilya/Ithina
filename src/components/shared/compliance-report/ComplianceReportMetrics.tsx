/**
 * Compliance Report Metrics Bar
 *
 * Horizontal row of metric cards for the full report.
 * Uses ReportSnippet metrics structure.
 */
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Package,
  XCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface ComplianceReportMetricsProps {
  complianceScore: number;
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
  issues: number;
  gap: number;
  className?: string;
}

export function ComplianceReportMetrics({
  complianceScore,
  matched,
  misplaced,
  missing,
  extra,
  issues,
  gap,
  className,
}: ComplianceReportMetricsProps) {
  const metrics = [
    {
      label: "Compliance",
      value: `${complianceScore}%`,
      variant: "neutral" as const,
      icon: null,
    },
    {
      label: "Matched",
      value: matched,
      variant: "matched" as const,
      icon: Check,
    },
    {
      label: "Misplaced",
      value: misplaced,
      variant: "misplaced" as const,
      icon: AlertTriangle,
    },
    {
      label: "Missing",
      value: missing,
      variant: "missing" as const,
      icon: XCircle,
    },
    {
      label: "Extra",
      value: extra,
      variant: "extra" as const,
      icon: Package,
    },
    {
      label: "Issues",
      value: issues,
      variant: "issues" as const,
      icon: AlertCircle,
    },
    { label: "Gap", value: gap, variant: "gap" as const, icon: null },
  ].filter((metric, index, all) => {
    // Avoid repeated cards with same label/value pair.
    const key = `${metric.label}:${metric.value}`;
    return (
      all.findIndex((entry) => `${entry.label}:${entry.value}` === key) ===
      index
    );
  });

  return (
    <div
      className={cn(
        "flex w-full gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {metrics.map((m) => (
        <MetricCard
          key={m.label}
          label={m.label}
          value={m.value}
          variant={m.variant}
          icon={m.icon}
        />
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  variant,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  variant:
    | "score"
    | "matched"
    | "misplaced"
    | "missing"
    | "extra"
    | "issues"
    | "neutral"
    | "gap";
  icon: React.ComponentType<{ className?: string }> | null;
}) {
  const variantStyles: Record<string, string> = {
    score: "border-border bg-card/60",
    matched: "border-chart-2/40 bg-chart-2/10",
    misplaced: "border-amber-500/40 bg-amber-500/10",
    missing: "border-destructive/40 bg-destructive/10",
    extra: "border-blue-500/40 bg-blue-500/10",
    issues: "border-action-warning/40 bg-action-warning/10",
    neutral: "border-border bg-card/60",
    gap: "border-destructive/50 bg-destructive/10",
  };

  const iconColors: Record<string, string> = {
    matched: "text-chart-2",
    misplaced: "text-amber-500",
    missing: "text-destructive",
    extra: "text-blue-500",
    issues: "text-action-warning",
  };

  const valueColors: Record<string, string> = {
    matched: "text-chart-2",
    misplaced: "text-amber-500",
    missing: "text-destructive",
    extra: "text-blue-500",
    issues: "text-action-warning",
    gap: "text-destructive",
  };

  return (
    <div
      className={cn(
        "flex h-11 min-w-48 shrink-0 flex-col items-center justify-center rounded-md border px-1 py-1 text-center",
        variantStyles[variant] ?? variantStyles.neutral,
      )}
    >
      <div className="flex items-center gap-1">
        {Icon && (
          <Icon
            className={cn(
              "size-3.5 shrink-0",
              iconColors[variant] ?? "text-muted-foreground",
            )}
            aria-hidden
          />
        )}
        <p
          className={cn(
            "text-sm font-semibold",
            valueColors[variant] ?? "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[9px] font-medium tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}
