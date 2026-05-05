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
  BarChart3,
  Info,
  Layers,
  Leaf,
  Lightbulb,
  PieChart,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { OverviewShelfBreakdown } from "./overview-shelf-breakdown";
import { OverviewSpaceEfficiencyChart } from "./overview-space-efficiency-chart";
import type {
  AllItemsReportData,
  ReportIssueDistribution,
  ReportKeyFinding,
  ReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";

export interface OverviewChartsTabProps {
  report: ReportSnippet;
  allItems?: AllItemsReportData | null;
  className?: string;
}

function ReportCard({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-card/60 rounded-xl border p-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Icon className="text-accent size-4 shrink-0" aria-hidden />
        <h3 className="text-foreground text-sm font-semibold tracking-wider uppercase">
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
        className="bg-destructive/30 flex size-4 shrink-0 items-center justify-center rounded-full"
        aria-hidden
      >
        <span className="bg-destructive size-2 rounded-full" />
      </span>
    );
  if (type === "warning")
    return (
      <span
        className="bg-action-warning/30 flex size-4 shrink-0 items-center justify-center rounded-full"
        aria-hidden
      >
        <span className="bg-action-warning size-2 rounded-full" />
      </span>
    );
  return <Info className="text-accent size-4 shrink-0" aria-hidden />;
}

function DonutChart({
  distribution,
  total,
}: {
  distribution: ReportIssueDistribution;
  total: number;
}) {
  if (total === 0) return null;
  const segments = [
    {
      key: "misplaced",
      label: "Misplaced",
      value: distribution.misplaced,
      color: "var(--action-warning)",
    },
    {
      key: "missing",
      label: "Missing",
      value: distribution.missing,
      color: "var(--destructive)",
    },
    {
      key: "extra",
      label: "Extra",
      value: distribution.extra,
      color: "#6366f1",
    },
  ].filter((segment) => segment.value > 0);

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <ResponsiveContainer width="100%" height={220}>
        <RechartsPieChart>
          <Tooltip content={<IssueDistributionTooltip total={total} />} />
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius={52}
            outerRadius={86}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {segments.map((segment) => (
              <Cell key={segment.key} fill={segment.color} />
            ))}
            <Label
              position="center"
              content={() => (
                <g>
                  <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    className="fill-foreground text-[14px] font-semibold"
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    className="fill-muted-foreground text-[10px]"
                  >
                    Total
                  </text>
                </g>
              )}
            />
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
      <div className="mt-1 grid grid-cols-3 gap-2">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-1.5 text-[10px]">
            <svg className="size-2 shrink-0" viewBox="0 0 8 8" aria-hidden>
              <circle cx="4" cy="4" r="4" fill={segment.color} />
            </svg>
            <span className="text-muted-foreground">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueDistributionTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: { label: string; value: number } }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const percentage = total > 0 ? Math.round((point.value / total) * 100) : 0;

  return (
    <div className="border-border bg-card rounded-md border px-2 py-1 text-[10px] shadow-md">
      <p className="text-foreground font-semibold">{point.label}</p>
      <p className="text-muted-foreground">
        {point.value} ({percentage}%)
      </p>
    </div>
  );
}

function ShelfComplianceHorizontalBarChart({
  shelfCompliance,
}: {
  shelfCompliance: ReportSnippet["shelfCompliance"];
}) {
  if (!shelfCompliance.length) {
    return (
      <p className="text-muted-foreground text-xs">No shelf compliance data.</p>
    );
  }

  const getBarFill = (compliance: number) => {
    if (compliance >= 80) return "var(--chart-2)";
    if (compliance > 0) return "var(--action-warning)";
    return "var(--destructive)";
  };
  const chartData = shelfCompliance.map((shelf) => ({
    shelfName: shelf.shelfName,
    compliance: Math.max(0, Math.min(100, shelf.compliance)),
    fill: getBarFill(shelf.compliance),
  }));
  const chartHeight = Math.max(220, shelfCompliance.length * 34 + 22);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 12, right: 44, left: 4, bottom: 8 }}
          barCategoryGap={10}
        >
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.45} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="shelfName"
            type="category"
            width={70}
            tickFormatter={(value) =>
              String(value).replaceAll(" ", "\u00A0")
            }
            tick={{ fill: "var(--foreground)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ShelfComplianceTooltip />} cursor={false} />
          <Bar dataKey="compliance" barSize={16} radius={3} background={{ fill: "var(--muted)" }}>
            <LabelList
              dataKey="compliance"
              content={({ x, y, width, height, value }) => (
                <text
                  x={Number(x) + Number(width) + 8}
                  y={Number(y) + Number(height) / 2}
                  fill="var(--foreground)"
                  fontSize={11}
                  fontWeight={500}
                  textAnchor="start"
                  dominantBaseline="middle"
                >
                  {value}%
                </text>
              )}
            />
            {chartData.map((entry) => (
              <Cell key={entry.shelfName} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ShelfComplianceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border bg-card rounded-md border px-2 py-1 text-[10px] shadow-md">
      <p className="text-foreground font-semibold">{label}</p>
      <p className="text-muted-foreground">{payload[0].value}% compliance</p>
    </div>
  );
}

export function OverviewChartsTab({
  report,
  allItems = null,
  className,
}: OverviewChartsTabProps) {
  const totalDistribution =
    report.issueDistribution.misplaced +
    report.issueDistribution.missing +
    report.issueDistribution.extra;

  return (
    <div className={cn("w-full min-w-0 space-y-3", className)}>
      {/* Top row: Executive Summary + AI Recommendations */}
      <div className="grid gap-3 lg:grid-cols-2">
        <ReportCard title="Executive Summary" icon={Info}>
          <p className="text-foreground text-sm leading-relaxed">
            {report.executiveSummary}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {report.keyFindings.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 rounded-lg px-2.5 py-2 text-xs",
                  f.type === "error" &&
                    "bg-destructive/10 border-destructive/30 border",
                  f.type === "warning" &&
                    "bg-action-warning/10 border-action-warning/30 border",
                  f.type === "info" && "bg-accent/10 border-accent/30 border",
                )}
              >
                <KeyFindingIcon type={f.type} />
                <span className="text-foreground">{f.text}</span>
              </div>
            ))}
          </div>
        </ReportCard>

        <ReportCard title="AI Recommendations" icon={Lightbulb}>
          <ul className="text-foreground space-y-1.5 text-xs">
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
      <div className="grid gap-3 lg:grid-cols-2">
        <ReportCard title="Compliance by Shelf" icon={BarChart3}>
          <ShelfComplianceHorizontalBarChart
            shelfCompliance={report.shelfCompliance}
          />
        </ReportCard>

        <ReportCard title="Planogram Issue Distribution" icon={PieChart}>
          <div className="flex justify-center">
            <DonutChart
              distribution={report.issueDistribution}
              total={totalDistribution}
            />
          </div>
        </ReportCard>
      </div>

      {/* Space Efficiency vs Weight */}
      <ReportCard title="Space Efficiency vs Weight" icon={Leaf}>
        <div className="bg-muted/10 rounded-lg p-1">
          <OverviewSpaceEfficiencyChart />
        </div>
      </ReportCard>

      {/* Shelf-by-Shelf Breakdown */}
      <ReportCard title="Shelf-by-Shelf Breakdown" icon={Layers}>
        <OverviewShelfBreakdown
          shelfCompliance={report.shelfCompliance}
          issuesToReview={report.issuesToReview}
          allItems={allItems}
        />
      </ReportCard>
    </div>
  );
}
