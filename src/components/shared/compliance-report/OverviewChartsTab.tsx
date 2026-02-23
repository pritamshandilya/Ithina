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

import { useState } from "react";
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
  ReportShelfCompliance,
  ReportIssueDistribution,
} from "@/features/maker/analysis";

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

/** Space Efficiency vs Weight – mock data for scatter/bubble chart */
interface SpaceEfficiencyPoint {
  name: string;
  weightKg: number;
  revenuePerSqFt: number;
  unitMargin: number;
  isHighEfficiency: boolean;
}

const SPACE_EFFICIENCY_DATA: SpaceEfficiencyPoint[] = [
  { name: "Green Pasta Stack", weightKg: 0.3, revenuePerSqFt: 63.17, unitMargin: 4.58, isHighEfficiency: true },
  { name: "Yellow Pasta Box", weightKg: 0.45, revenuePerSqFt: 52.1, unitMargin: 6.2, isHighEfficiency: true },
  { name: "White Pasta Box", weightKg: 0.38, revenuePerSqFt: 48.5, unitMargin: 5.1, isHighEfficiency: true },
  { name: "Black Pasta Box", weightKg: 0.42, revenuePerSqFt: 41.2, unitMargin: 3.8, isHighEfficiency: false },
  { name: "Red Pasta Stack", weightKg: 0.25, revenuePerSqFt: 38.9, unitMargin: 2.9, isHighEfficiency: false },
  { name: "Black Pasta Bag", weightKg: 0.55, revenuePerSqFt: 35.4, unitMargin: 2.1, isHighEfficiency: false },
  { name: "Potato Chips", weightKg: 0.15, revenuePerSqFt: 95.2, unitMargin: 7.5, isHighEfficiency: true },
  { name: "Tortilla Chips", weightKg: 0.2, revenuePerSqFt: 72.8, unitMargin: 5.2, isHighEfficiency: true },
  { name: "Coca-Cola 500ml", weightKg: 0.52, revenuePerSqFt: 58.3, unitMargin: 4.1, isHighEfficiency: false },
  { name: "Water Bottle 1L", weightKg: 0.55, revenuePerSqFt: 28.4, unitMargin: 1.8, isHighEfficiency: false },
];

const CHART_WIDTH = 560;
const CHART_HEIGHT = 200;
const PADDING = { top: 16, right: 16, bottom: 32, left: 44 };
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;
const X_MIN = 0;
const X_MAX = 0.6;
const Y_MIN = 0;
const Y_MAX = 160;
const BUBBLE_MIN_SIZE = 6;
const BUBBLE_MAX_SIZE = 18;

function SpaceEfficiencyChart() {
  const [tooltip, setTooltip] = useState<SpaceEfficiencyPoint | null>(null);

  const xScale = (v: number) =>
    PADDING.left + (PLOT_WIDTH * (v - X_MIN)) / (X_MAX - X_MIN);
  const yScale = (v: number) =>
    PADDING.top + PLOT_HEIGHT - (PLOT_HEIGHT * (v - Y_MIN)) / (Y_MAX - Y_MIN);

  const marginRange = Math.max(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin)) -
    Math.min(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin)) || 1;
  const bubbleScale = (v: number) =>
    BUBBLE_MIN_SIZE +
    ((v - Math.min(...SPACE_EFFICIENCY_DATA.map((d) => d.unitMargin))) / marginRange) *
      (BUBBLE_MAX_SIZE - BUBBLE_MIN_SIZE);

  return (
    <div className="flex gap-4">
      <div className="relative flex-1 min-w-0">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-[220px] min-h-[220px]"
          preserveAspectRatio="xMidYMid meet"
        >
        {/* Grid lines */}
        {[40, 80, 120].map((y) => (
          <line
            key={y}
            x1={PADDING.left}
            y1={yScale(y)}
            x2={CHART_WIDTH - PADDING.right}
            y2={yScale(y)}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity={2.0}
          />
        ))}
        {[0.15, 0.3, 0.45].map((xVal) => (
          <line
            key={xVal}
            x1={xScale(xVal)}
            y1={PADDING.top}
            x2={xScale(xVal)}
            y2={CHART_HEIGHT - PADDING.bottom}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        ))}

        {/* X axis labels */}
        {[0, 0.15, 0.3, 0.45, 0.6].map((xVal) => (
          <text
            key={xVal}
            x={xScale(xVal)}
            y={CHART_HEIGHT - 8}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {`${xVal}kg`}
          </text>
        ))}

        {/* Y axis labels */}
        {[40, 80, 120, 160].map((y) => (
          <text
            key={y}
            x={PADDING.left - 6}
            y={yScale(y) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {y}
          </text>
        ))}


        {/* Bubbles */}
        {SPACE_EFFICIENCY_DATA.map((d, i) => {
          const r = bubbleScale(d.unitMargin);
          const cx = xScale(d.weightKg);
          const cy = yScale(d.revenuePerSqFt);
          const fill = d.isHighEfficiency ? "var(--chart-2)" : "#8b5cf6";

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                fillOpacity={0.85}
                stroke="var(--card)"
                strokeWidth={1}
                onMouseEnter={() => setTooltip(d)}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute left-0 bottom-0 z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs pointer-events-none">
            <p className="font-semibold text-foreground">{tooltip.name}</p>
            <p>Weight: {tooltip.weightKg} kg</p>
            <p>Contrib/SqFt: ${tooltip.revenuePerSqFt.toFixed(2)}</p>
            <p>Unit Margin: ${tooltip.unitMargin.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* How to read legend */}
      <div className="shrink-0 rounded border border-border bg-card/95 px-2.5 py-2 text-[10px] text-muted-foreground w-[130px]">
        <p className="font-semibold text-foreground mb-1">How to read</p>
        <p>X = weight (kg)</p>
        <p>Y = revenue/sq ft</p>
        <p>bubble = unit margin</p>
        <p className="mt-1 text-chart-2">Green = high space-efficiency</p>
        <p className="text-indigo-400">Indigo = lower contribution/sq ft</p>
      </div>
    </div>
  );
}

/** Placeholder shelf product for Shelf-by-Shelf Breakdown */
const PLACEHOLDER_SHELF_PRODUCTS: Record<string, Array<{ name: string; status: "matched" | "misplaced" | "missing" | "extra"; count: string }>> = {
  "Shelf 1": [
    { name: "Potato Chips 4/4", status: "matched", count: "D3" },
    { name: "Tortilla Chips 2/2", status: "misplaced", count: "D3" },
  ],
  "Shelf 2": [
    { name: "Coca-Cola 500ml 0/6", status: "missing", count: "D3" },
    { name: "Water Bottle 1L 0/3", status: "extra", count: "D3" },
    { name: "Energy Drink 0/6", status: "matched", count: "D3" },
  ],
  "Shelf 3": [
    { name: "Orange Juice 1L 0/4", status: "missing", count: "D3" },
    { name: "Sports Drink 2/2", status: "matched", count: "D3" },
    { name: "Iced Tea 500ml 0/6", status: "missing", count: "D3" },
  ],
  "Shelf 4": [
    { name: "Mineral Water 1L 0/3", status: "missing", count: "D3" },
    { name: "Soft Drink 2L 0/4", status: "missing", count: "D3" },
    { name: "Pretzels 2/2", status: "misplaced", count: "D3" },
  ],
};

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
          <SpaceEfficiencyChart />
        </div>
      </ReportCard>

      {/* Shelf-by-Shelf Breakdown */}
      <ReportCard title="Shelf-by-Shelf Breakdown" icon={Layers}>
        <div className="space-y-4">
          {report.shelfCompliance.map((shelf: ReportShelfCompliance) => {
            const products =
              PLACEHOLDER_SHELF_PRODUCTS[shelf.shelfName] ?? [];
            const matchedCount = products.filter((p) => p.status === "matched").length;
            const misplacedCount = products.filter((p) => p.status === "misplaced").length;
            const missingCount = products.filter((p) => p.status === "missing").length;

            return (
              <div
                key={shelf.shelfName}
                className="border-b border-border pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {shelf.shelfName} {shelf.shelfLabel ?? ""}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {shelf.units ?? 0} units · {shelf.skuCount ?? 0} SKUs
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-3 rounded bg-muted/60 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded transition-all",
                        shelf.compliance >= 80
                          ? "bg-chart-2"
                          : shelf.compliance > 0
                            ? "bg-action-warning"
                            : "bg-muted"
                      )}
                      style={{ width: `${shelf.compliance}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium w-10 text-right",
                      shelf.compliance >= 80
                        ? "text-chart-2"
                        : "text-muted-foreground"
                    )}
                  >
                    {shelf.compliance}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {products.map((p, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                        p.status === "matched" &&
                          "bg-chart-2/20 text-chart-2 border border-chart-2/40",
                        p.status === "misplaced" &&
                          "bg-action-warning/20 text-action-warning border border-action-warning/40",
                        p.status === "missing" &&
                          "bg-destructive/20 text-destructive border border-destructive/40",
                        p.status === "extra" &&
                          "bg-blue-500/20 text-blue-500 border border-blue-500/40"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          p.status === "matched" && "bg-chart-2",
                          p.status === "misplaced" && "bg-action-warning",
                          p.status === "missing" && "bg-destructive",
                          p.status === "extra" && "bg-blue-500"
                        )}
                      />
                      {p.name}
                      <span
                        className={cn(
                          "rounded px-1 text-[10px]",
                          p.status === "matched" && "bg-chart-2/30",
                          p.status === "misplaced" && "bg-action-warning/30",
                          p.status === "missing" && "bg-destructive/30",
                          p.status === "extra" && "bg-blue-500/30"
                        )}
                      >
                        {p.count}
                      </span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {matchedCount} matched {misplacedCount} misplaced {missingCount}{" "}
                  missing
                </p>
              </div>
            );
          })}
        </div>
      </ReportCard>
    </div>
  );
}
