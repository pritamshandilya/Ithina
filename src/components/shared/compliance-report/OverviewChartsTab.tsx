/**
 * Overview & Charts Tab
 *
 * Main content for the Overview & Charts subtab of the full report.
 * Includes: Executive Summary, AI Recommendations, Compliance by Shelf,
 * Planogram Issue Distribution, All Issues Breakdown, Space Efficiency vs Weight,
 * and Shelf-by-Shelf Breakdown.
 *
 * Uses placeholder content; will be wired to dynamic data later.
 */

import {
  Info,
  Lightbulb,
  BarChart3,
  PieChart,
  AlertTriangle,
  Leaf,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ReportSnippet,
  ReportKeyFinding,
  ReportIssueDistribution,
} from "@/lib/analysis";
import { OverviewShelfBreakdown } from "./overview-shelf-breakdown";
import { OverviewSpaceEfficiencyChart } from "./overview-space-efficiency-chart";

export interface OverviewChartsTabProps {
  report: ReportSnippet;
  className?: string;
}

function ReportCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/60 p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-accent shrink-0" aria-hidden />
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function KeyFindingIcon({ type }: { type: ReportKeyFinding["type"] }) {
  if (type === "error")
    return (
      <span
        className="size-4 rounded-full bg-destructive/30 flex items-center justify-center shrink-0"
        aria-hidden
      >
        <span className="size-2 rounded-full bg-destructive" />
      </span>
    );
  if (type === "warning")
    return (
      <span
        className="size-4 rounded-full bg-action-warning/30 flex items-center justify-center shrink-0"
        aria-hidden
      >
        <span className="size-2 rounded-full bg-action-warning" />
      </span>
    );
  return (
    <Info className="size-4 shrink-0 text-accent" aria-hidden />
  );
}

function DonutChart({
  distribution,
  total,
}: {
  distribution: ReportIssueDistribution;
  total: number;
}) {
  if (total === 0) return null;
  const cx = 50;
  const cy = 50;
  const or = 40;
  const ir = 28;
  const segments = [
    { value: distribution.matched, color: "var(--chart-2)" },
    { value: distribution.misplaced, color: "var(--action-warning)" },
    { value: distribution.missing, color: "var(--destructive)" },
    { value: distribution.extra, color: "#6366f1" },
  ];

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let startAngle = -90;

  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-28">
        {segments.map((s, i) => {
          const angle = (s.value / total) * 360;
          const endAngle = startAngle + angle;
          const x1 = cx + or * Math.cos(toRad(startAngle));
          const y1 = cy + or * Math.sin(toRad(startAngle));
          const x2 = cx + or * Math.cos(toRad(endAngle));
          const y2 = cy + or * Math.sin(toRad(endAngle));
          const x3 = cx + ir * Math.cos(toRad(endAngle));
          const y3 = cy + ir * Math.sin(toRad(endAngle));
          const x4 = cx + ir * Math.cos(toRad(startAngle));
          const y4 = cy + ir * Math.sin(toRad(startAngle));
          const largeArc = angle > 180 ? 1 : 0;
          const path = `M ${x1} ${y1} A ${or} ${or} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
          startAngle = endAngle;
          return <path key={i} d={path} fill={s.color} />;
        })}
      </svg>
    </div>
  );
}


export function OverviewChartsTab({ report, className }: OverviewChartsTabProps) {
  const totalDistribution =
    report.issueDistribution.matched +
    report.issueDistribution.misplaced +
    report.issueDistribution.missing +
    report.issueDistribution.extra;

  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      {/* Top row: Executive Summary + AI Recommendations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ReportCard title="Executive Summary" icon={Info}>
          <p className="text-sm text-foreground leading-relaxed">
            {report.executiveSummary}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.keyFindings.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 rounded-lg px-3 py-2.5 text-sm",
                  f.type === "error" && "bg-destructive/10 border border-destructive/30",
                  f.type === "warning" && "bg-action-warning/10 border border-action-warning/30",
                  f.type === "info" && "bg-accent/10 border border-accent/30"
                )}
              >
                <KeyFindingIcon type={f.type} />
                <span className="text-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </ReportCard>

        <ReportCard title="AI Recommendations" icon={Lightbulb}>
          <ul className="space-y-2 text-sm text-foreground">
            {report.aiRecommendations.map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-accent shrink-0">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </ReportCard>
      </div>

      {/* Charts row: Compliance by Shelf, Issue Distribution, All Issues Breakdown */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ReportCard title="Compliance by Shelf" icon={BarChart3}>
          <div className="space-y-3">
            {report.shelfCompliance.map((s) => (
              <div key={s.shelfName} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-medium text-foreground truncate text-right">
                  {s.shelfName}
                </span>
                <div className="flex-1 h-5 rounded bg-muted/60 overflow-hidden min-w-[60px]">
                  <div
                    className={cn(
                      "h-full rounded transition-all",
                      s.compliance >= 80
                        ? "bg-chart-2"
                        : s.compliance > 0
                          ? "bg-action-warning"
                          : "bg-destructive/70"
                    )}
                    style={{ width: `${s.compliance}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-8 text-right">
                  {s.compliance}%
                </span>
              </div>
            ))}
          </div>
        </ReportCard>

        <ReportCard title="Planogram Issue Distribution" icon={PieChart}>
          <div className="flex items-center gap-4">
            <DonutChart
              distribution={report.issueDistribution}
              total={totalDistribution}
            />
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-chart-2" aria-hidden />
                Matched: {report.issueDistribution.matched}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-action-warning" aria-hidden />
                Misplaced: {report.issueDistribution.misplaced}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-destructive" aria-hidden />
                Missing: {report.issueDistribution.missing}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-500" aria-hidden />
                Extra: {report.issueDistribution.extra}
              </span>
            </div>
          </div>
        </ReportCard>

        <ReportCard title="All Issues Breakdown" icon={AlertTriangle}>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {report.issueCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2"
              >
                <span className="w-24 shrink-0 text-xs font-medium text-foreground truncate">
                  {cat.title}
                </span>
                <div className="flex-1 h-4 rounded bg-muted/60 overflow-hidden min-w-[40px]">
                  <div
                    className={cn(
                      "h-full rounded",
                      cat.variant === "matched" && "bg-chart-2",
                      cat.variant === "misplaced" && "bg-action-warning",
                      cat.variant === "missing" && "bg-destructive",
                      cat.variant === "extra" && "bg-blue-500",
                      cat.variant === "analysis" && "bg-accent",
                      cat.variant === "depth" && "bg-teal-500"
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        (cat.count / Math.max(...report.issueCategories.map((c) => c.count))) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground w-6 text-right">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </ReportCard>
      </div>

      {/* Space Efficiency vs Weight */}
      <ReportCard title="Space Efficiency vs Weight" icon={Leaf}>
        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <OverviewSpaceEfficiencyChart />
        </div>
      </ReportCard>

      {/* Shelf-by-Shelf Breakdown */}
      <ReportCard title="Shelf-by-Shelf Breakdown" icon={Layers}>
        <OverviewShelfBreakdown shelfCompliance={report.shelfCompliance} />
      </ReportCard>
    </div>
  );
}
