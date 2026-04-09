import { BarChart3, PieChart } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCheckerDashboardStats } from "@/queries/checker";
import { cn } from "@/lib/utils";
import type {
  CheckerDailyCompliance,
  CheckerShelfBreakdown,
} from "@/types/checker";

const CHART_WIDTH = 420;
const CHART_HEIGHT = 220;
const PADDING = { top: 20, right: 20, bottom: 48, left: 52 };

export interface CheckerPerformanceChartsProps {
  className?: string;
}

function ComplianceTrendBarChart({
  data,
}: {
  data: CheckerDailyCompliance[];
}) {
  const maxScore = 100;
  const maxApproved = Math.max(1, ...data.map((d) => d.approved));
  const plotW = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotH = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const barGap = 6;
  const groupWidth = plotW / data.length - barGap;
  const barWidth = (groupWidth - barGap) / 2;

  const yScaleScore = (v: number) =>
    PADDING.top + plotH - (plotH * v) / maxScore;
  const yScaleApproved = (v: number) =>
    PADDING.top + plotH - (plotH * v) / maxApproved;

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full max-w-[420px] h-[220px] min-h-[200px]"
      role="img"
      aria-labelledby="compliance-chart-title compliance-chart-desc"
    >
      <title id="compliance-chart-title">Compliance Trend (7 Days)</title>
      <desc id="compliance-chart-desc">
        Bar chart showing average compliance score and approved audits per day. X-axis: Day of week. Y-axis: Score (0-100) and count.
      </desc>

      {/* Y-axis label */}
      <text
        x={14}
        y={PADDING.top + plotH / 2}
        textAnchor="middle"
        transform={`rotate(-90, 14, ${PADDING.top + plotH / 2})`}
        className="fill-muted-foreground"
        style={{ fontSize: 11, fontWeight: 500 }}
      >
        Score / Count
      </text>

      {/* Y-axis ticks for score (0-100) */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = yScaleScore(tick);
        return (
          <g key={tick}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={PADDING.left + plotW}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.6}
            />
            <text
              x={PADDING.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground tabular-nums"
              style={{ fontSize: 10 }}
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* X-axis label */}
      <text
        x={PADDING.left + plotW / 2}
        y={CHART_HEIGHT - 12}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: 11, fontWeight: 500 }}
      >
        Day of Week
      </text>

      {/* Bars */}
      {data.map((d, i) => {
        const x = PADDING.left + i * (plotW / data.length) + barGap / 2;
        const scoreH = (d.avgScore / maxScore) * plotH;
        const approvedH = (d.approved / maxApproved) * plotH;
        return (
          <g key={d.day}>
            <rect
              x={x}
              y={yScaleScore(d.avgScore)}
              width={barWidth}
              height={scoreH}
              rx={3}
              fill="var(--chart-2)"
              className="cursor-pointer transition-opacity hover:opacity-90"
            >
              <title>
                {d.label}: Avg {d.avgScore.toFixed(1)}% compliance
              </title>
            </rect>
            <rect
              x={x + barWidth + barGap}
              y={yScaleApproved(d.approved)}
              width={barWidth}
              height={approvedH}
              rx={3}
              fill="var(--chart-1)"
              className="cursor-pointer transition-opacity hover:opacity-90"
            >
              <title>
                {d.label}: {d.approved} approved
              </title>
            </rect>
          </g>
        );
      })}

      {/* X-axis day labels */}
      {data.map((d, i) => (
        <text
          key={d.day}
          x={PADDING.left + (i + 0.5) * (plotW / data.length)}
          y={CHART_HEIGHT - 28}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 11 }}
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

function ShelfBreakdownDonutChart({ data }: { data: CheckerShelfBreakdown[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  const cx = 50;
  const cy = 50;
  const r = 40;
  const ir = 26;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let startAngle = -90;

  return (
    <div className="flex items-center gap-6">
      <svg
        viewBox="0 0 100 100"
        className="size-36 shrink-0 min-w-[144px] min-h-[144px]"
        aria-label="Shelf status breakdown"
      >
        {data.map((s, i) => {
          const angle = (s.count / total) * 360;
          const endAngle = startAngle + angle;
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          const x1 = cx + r * Math.cos(toRad(startAngle));
          const y1 = cy + r * Math.sin(toRad(startAngle));
          const x2 = cx + r * Math.cos(toRad(endAngle));
          const y2 = cy + r * Math.sin(toRad(endAngle));
          const x3 = cx + ir * Math.cos(toRad(endAngle));
          const y3 = cy + ir * Math.sin(toRad(endAngle));
          const x4 = cx + ir * Math.cos(toRad(startAngle));
          const y4 = cy + ir * Math.sin(toRad(startAngle));
          const largeArc = angle > 180 ? 1 : 0;
          const path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
          startAngle = endAngle;
          return (
            <path
              key={i}
              d={path}
              fill={s.color}
              className="cursor-pointer transition-opacity hover:opacity-90"
            >
              <title>
                {s.label}: {s.count} ({pct}%)
              </title>
            </path>
          );
        })}
      </svg>
      <div className="flex flex-col gap-2">
        {data.map((s, i) => {
          const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2 group cursor-default"
              title={`${s.label}: ${s.count} (${pct}%)`}
            >
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">
                {s.label}: <span className="font-medium text-foreground">{s.count}</span>
                <span className="text-muted-foreground/80 ml-1">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Checker performance charts - Compliance trend and shelf status breakdown
 */
export function CheckerPerformanceCharts({
  className,
}: CheckerPerformanceChartsProps) {
  const { data, isLoading, error } = useCheckerDashboardStats();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Store & Shelf Insights
        </h2>
        
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="size-4 text-accent shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Compliance Trend (7 Days)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Store-level avg compliance and approved audits per day
          </p>
          <ComplianceTrendBarChart data={data.weeklyCompliance} />
          <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-chart-2" aria-hidden />
              Avg Compliance
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-chart-1" aria-hidden />
              Approved
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="size-4 text-accent shrink-0" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">
              Shelf Status Breakdown
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Shelves in this store by status
          </p>
          <ShelfBreakdownDonutChart data={data.shelfBreakdown} />
        </div>
      </div>
    </div>
  );
}
