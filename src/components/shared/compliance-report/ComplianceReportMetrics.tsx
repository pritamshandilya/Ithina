/**
 * Compliance Report Metrics Bar
 *
 * Horizontal row of metric cards for the full report.
 * Uses ReportSnippet metrics structure.
 */

import { Check, AlertTriangle, XCircle, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComplianceReportMetricsProps {
  complianceScore: number;
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
  issues: number;
  facings: number;
  units: number;
  detected: number;
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
  facings,
  units,
  detected,
  gap,
  className,
}: ComplianceReportMetricsProps) {
  const metrics = [
    {
      label: "Category",
      value: `${complianceScore}%`,
      variant: "score" as const,
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
    { label: "Facings", value: facings, variant: "neutral" as const, icon: null },
    { label: "Units", value: units, variant: "neutral" as const, icon: null },
    { label: "Detected", value: detected, variant: "neutral" as const, icon: null },
    {
      label: "Gap",
      value: gap,
      variant: "gap" as const,
      icon: null,
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 w-full",
        className
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
  const score =
    variant === "score" && typeof value === "string"
      ? parseInt(value, 10)
      : null;

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
        "rounded-lg border px-2.5 py-2 min-w-0 text-center flex flex-col items-center justify-center",
        variantStyles[variant] ?? variantStyles.neutral
      )}
    >
      {variant === "score" && score !== null ? (
        <div className="relative size-10 mb-0.5">
          <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={
                score >= 80
                  ? "var(--chart-2)"
                  : score > 0
                    ? "var(--action-warning)"
                    : "var(--destructive)"
              }
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 100} 100`}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
            {value}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {Icon && (
            <Icon
              className={cn("size-4 shrink-0", iconColors[variant] ?? "text-muted-foreground")}
              aria-hidden
            />
          )}
          <p
            className={cn(
              "text-lg font-bold",
              valueColors[variant] ?? "text-foreground"
            )}
          >
            {value}
          </p>
        </div>
      )}
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
        {label}
      </p>
    </div>
  );
}
