/**
 * Analysis Report View
 *
 * Two-column layout shown after pipeline completes:
 * - Left: Shelf View (image + controls)
 * - Right: Analysis Report with tabs (SKU List, Compliance, Strategy & Optimization)
 */

import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  Eye,
  LayoutGrid,
  List,
  RefreshCw,
  Scale,
  Shield,
  TrendingUp,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type {
  SkuEnrichmentItem,
  SkuIssueDetail,
} from "@/features/maker/analysis";

export type AnalysisReportTab = "sku-list" | "compliance" | "strategy";

export interface AnalysisReportViewProps {
  /** Shelf image preview URL (data URL or blob URL) */
  imagePreview: string | null;
  /** SKU items from pipeline (enriched) – used for SKU List tab */
  skuItems: SkuEnrichmentItem[];
  /** Optional: quantity per SKU (id -> count). Falls back to mock if missing */
  skuQuantities?: Record<string, number>;
  /** Optional: issue count per SKU (id -> count). Falls back to 0 if missing */
  skuIssues?: Record<string, number>;
  /** Optional: issue details per SKU (id -> details). Shown in hover tooltip */
  skuIssueDetails?: Record<string, SkuIssueDetail[]>;
  /** Callback when user wants to upload a new image */
  onUploadImage?: () => void;
  /** Callback when user resets */
  onReset?: () => void;
}

export function AnalysisReportView({
  imagePreview,
  skuItems,
  skuQuantities = {},
  skuIssues = {},
  skuIssueDetails = {},
  onUploadImage,
  onReset,
}: AnalysisReportViewProps) {
  const [activeTab, setActiveTab] = useState<AnalysisReportTab>("sku-list");

  const tabs: { id: AnalysisReportTab; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { id: "sku-list", label: "SKU List", icon: List },
    { id: "compliance", label: "Compliance", icon: Check },
    { id: "strategy", label: "Strategy & Optimization", icon: BarChart3 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.2fr_1fr] lg:h-[min(600px,calc(100vh-18rem))] lg:overflow-hidden">
      {/* Left: Shelf View */}
      <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Shelf View</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-muted-foreground cursor-not-allowed"
            >
              <Camera className="size-4" aria-hidden />
              Auto-Detect Off
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onUploadImage}
              className="text-muted-foreground"
            >
              <Upload className="size-4" aria-hidden />
              Upload Image
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="size-4" aria-hidden />
              View Image
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="size-4" aria-hidden />
              Reset
            </Button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden bg-muted/30">
          {imagePreview ? (
            <div className="aspect-video w-full overflow-hidden min-h-0">
              <img
                src={imagePreview}
                alt="Shelf analysis"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center text-muted-foreground">
              <p className="text-sm">No image</p>
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="border-t border-border px-4 py-2 flex flex-wrap gap-4 text-xs text-muted-foreground shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-chart-2" aria-hidden />
            Compliant Product
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-destructive" aria-hidden />
            Product with Issues
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm border border-dashed border-muted-foreground"
              aria-hidden
            />
            Shelf Row
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded-sm border border-destructive"
              aria-hidden
            />
            Empty Space
          </span>
        </div>
      </section>

      {/* Right: Analysis Report */}
      <section className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="border-b border-border px-4 py-3 flex items-center gap-2 shrink-0">
          <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Analysis Report</h2>
        </div>

        {/* Tab navigation */}
        <nav
          className="flex gap-0 border-b border-border px-4"
          aria-label="Report sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                <span className="flex items-center gap-2">
                  {Icon && <Icon className="size-3.5" />}
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-chart-2"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab content - flex-1 min-h-0 ensures scroll works when content overflows */}
        <div className="flex-1 min-h-0 overflow-auto p-4" role="tabpanel">
          {activeTab === "sku-list" && (
            <SkuListTab
              skuItems={skuItems}
              skuQuantities={skuQuantities}
              skuIssues={skuIssues}
              skuIssueDetails={skuIssueDetails}
            />
          )}
          {activeTab === "compliance" && (
            <ComplianceTab
              skuItems={skuItems}
              skuQuantities={skuQuantities}
              skuIssues={skuIssues}
              skuIssueDetails={skuIssueDetails}
            />
          )}
          {activeTab === "strategy" && (
            <StrategyTab
              skuItems={skuItems}
              skuQuantities={skuQuantities}
            />
          )}
        </div>
      </section>
    </div>
  );
}

/** Mock issue details for SKUs with issues when skuIssueDetails not provided */
function getMockIssueDetails(
  productName: string
): SkuIssueDetail[] {
  return [
    {
      type: "LOW MARGIN PRIME",
      description: `${productName} should be at eye level`,
      reason: "High margin items generate more revenue when placed at eye level",
    },
  ];
}

function SkuListTab({
  skuItems,
  skuQuantities,
  skuIssues,
  skuIssueDetails,
}: {
  skuItems: SkuEnrichmentItem[];
  skuQuantities: Record<string, number>;
  skuIssues: Record<string, number>;
  skuIssueDetails: Record<string, SkuIssueDetail[]>;
}) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <List className="size-3.5" />
        Identified SKUs with Quantity
      </p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground">
                SKU / Product Label
              </th>
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground w-24">
                Quantity
              </th>
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground w-24">
                Issues
              </th>
            </tr>
          </thead>
          <tbody>
            {skuItems.map((item) => {
              const idNum = parseInt(item.id, 10) || 0;
              const qty = skuQuantities[item.id] ?? (7 + (idNum % 8));
              const issues = skuIssues[item.id] ?? (idNum % 5 === 2 ? 1 : 0);
              return (
                <tr key={item.id} className="border-b border-border/60 hover:bg-muted/30">
                  <td className="py-2.5 px-2 font-medium text-foreground">
                    {item.productName}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="inline-flex items-center rounded-full bg-chart-2/20 text-chart-2 px-2.5 py-0.5 text-xs font-medium">
                      {qty}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    {issues === 0 ? (
                      <Check className="size-4 text-chart-2" aria-hidden />
                    ) : (() => {
                      const details =
                        skuIssueDetails[item.id] ??
                        getMockIssueDetails(item.productName);
                      const issueBadge = (
                        <span className="inline-flex items-center rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-xs font-medium cursor-help">
                          {issues} issue{issues !== 1 ? "s" : ""}
                        </span>
                      );
                      return details.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{issueBadge}</TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="start"
                            sideOffset={4}
                            className="max-w-[280px] p-3 space-y-2"
                          >
                            {details.map((d, i) => (
                              <div key={i} className="space-y-1">
                                <p className="text-xs font-bold uppercase text-destructive">
                                  {d.type}
                                </p>
                                <p className="text-sm text-foreground">
                                  {d.description}
                                </p>
                                <p className="text-xs text-muted-foreground italic">
                                  Why: {d.reason}
                                </p>
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        issueBadge
                      );
                    })()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Mock pipeline log entries for System Log */
const MOCK_SYSTEM_LOG = [
  { tag: "INIT", message: "Pipeline ready" },
  { tag: "YOLO", message: "Detected 94 bounding boxes" },
  { tag: "HOUGH", message: "Identified 5 shelf rows" },
  { tag: "CLIP", message: "Embeddings matched to database" },
  { tag: "INPUT", message: "User enrichment applied" },
  { tag: "GEOM", message: "Spatial mapping finalized" },
  { tag: "REPORT", message: "Compliance report generated" },
];

function ComplianceTab({
  skuItems,
  skuQuantities,
  skuIssues,
  skuIssueDetails,
}: {
  skuItems: SkuEnrichmentItem[];
  skuQuantities: Record<string, number>;
  skuIssues: Record<string, number>;
  skuIssueDetails: Record<string, SkuIssueDetail[]>;
}) {
  const totalSkus = skuItems.reduce(
    (sum, item) => sum + (skuQuantities[item.id] ?? 7 + (parseInt(item.id, 10) || 0) % 8),
    0
  );
  const rowsDetected = 5;

  const facingsData = skuItems
    .slice(0, 8)
    .map((item) => {
      const idNum = parseInt(item.id, 10) || 0;
      const qty = skuQuantities[item.id] ?? 7 + (idNum % 8);
      return { label: item.productName, count: qty };
    })
    .sort((a, b) => b.count - a.count);

  const maxFacing = Math.max(...facingsData.map((d) => d.count), 1);

  const auditIssues = skuItems
    .filter((item) => {
      const idNum = parseInt(item.id, 10) || 0;
      const issues = skuIssues[item.id] ?? (idNum % 5 === 2 ? 1 : 0);
      return issues > 0;
    })
    .map((item) => {
      const details =
        skuIssueDetails[item.id] ?? getMockIssueDetails(item.productName);
      return { sku: item.productName, details };
    })
    .flatMap(({ sku, details }) =>
      details.map((d) => ({ sku, ...d }))
    );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total SKUs
          </p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">{totalSkus}</p>
        </div>
        <div className="rounded-lg border border-border bg-card/60 px-4 py-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Rows detected
          </p>
          <p className="mt-0.5 text-2xl font-bold text-foreground">
            {rowsDetected}
          </p>
        </div>
      </div>

      {/* Detected Facings */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Detected Facings
        </h3>
        <div className="space-y-2.5">
          {facingsData.map(({ label, count }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-foreground">
                {label}
              </span>
              <div className="flex-1 min-w-0 h-5 rounded bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded bg-accent/70 transition-all duration-300"
                  style={{ width: `${(count / maxFacing) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium text-muted-foreground">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance Audit */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compliance Audit
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="border-accent/50 text-accent hover:bg-accent/10"
          >
            <Shield className="size-3.5" aria-hidden />
            Default
          </Button>
        </div>
        {auditIssues.length > 0 ? (
          <div className="space-y-2">
            {auditIssues.map((issue, i) => (
              <div
                key={`${issue.sku}-${i}`}
                className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2.5"
              >
                <div className="flex gap-2">
                  <AlertTriangle
                    className="size-4 shrink-0 text-action-warning mt-0.5"
                    aria-hidden
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-bold uppercase text-destructive">
                      {issue.type}
                    </p>
                    <p className="text-sm text-foreground">{issue.description}</p>
                    <p className="text-xs text-muted-foreground italic">
                      Why: {issue.reason}
                    </p>
                    <p className="text-xs font-semibold text-destructive mt-1">
                      SKU: {issue.sku}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card/40 px-4 py-6 text-center">
            <Check className="mx-auto size-8 text-chart-2" aria-hidden />
            <p className="mt-2 text-sm font-medium text-foreground">
              No compliance issues
            </p>
            <p className="text-xs text-muted-foreground">
              All SKUs meet placement guidelines
            </p>
          </div>
        )}
      </section>

      {/* System Log */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          System Log
        </h3>
        <div className="rounded-lg border border-border bg-muted/20 font-mono text-xs">
          {MOCK_SYSTEM_LOG.map((entry, i) => (
            <div
              key={i}
              className="flex gap-2 px-3 py-1.5 border-b border-border/60 last:border-0"
            >
              <span className="shrink-0 text-chart-2 font-medium">
                [{entry.tag}]
              </span>
              <span className="text-foreground">{entry.message}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Contrib/SqFt derived from contribution and weight for scatter plot */
function contribPerSqFt(contribution: number, weight: number): number {
  const footprint = weight * 0.35 + 0.2;
  return Math.round((contribution / footprint) * 8 * 100) / 100;
}

function StrategyTab({
  skuItems,
  skuQuantities,
}: {
  skuItems: SkuEnrichmentItem[];
  skuQuantities: Record<string, number>;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    productName: string;
    weight: number;
    contribPerSqFt: number;
    unitMargin: number;
  } | null>(null);

  const topContribItems = skuItems
    .map((item) => {
      const idNum = parseInt(item.id, 10) || 0;
      const units = skuQuantities[item.id] ?? 7 + (idNum % 8);
      return { ...item, units };
    })
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 6);

  const scatterData = skuItems.map((item) => ({
    productName: item.productName,
    weight: item.weight,
    contrib: item.contribution,
    contribPerSqFt: contribPerSqFt(item.contribution, item.weight),
  }));

  const heavyItems = skuItems.filter((item) => item.weight > 1.5);

  const HEAVY_THRESHOLD_KG = 1.5;
  const X_MAX = 1.2;
  const Y_MAX = 120;
  const CHART_W = 300;
  const CHART_H = 180;
  const PADDING = { left: 44, right: 16, top: 16, bottom: 36 };
  const X_TICKS = [0, 0.3, 0.6, 0.9, 1.2];
  const Y_TICKS = [0, 30, 60, 90, 120];

  const toX = (w: number) =>
    PADDING.left + ((w / X_MAX) * (CHART_W - PADDING.left - PADDING.right));
  const toY = (c: number) =>
    PADDING.top +
    CHART_H -
    PADDING.bottom -
    (c / Y_MAX) * (CHART_H - PADDING.top - PADDING.bottom);

  const highContribNames = topContribItems
    .slice(0, 3)
    .map((i) => i.productName)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <section className="rounded-lg border border-accent/40 bg-accent/15 px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <LayoutGrid className="size-4 text-accent" aria-hidden />
          <h3 className="text-xs font-bold uppercase tracking-wider text-accent">
            AI Recommendations
          </h3>
        </div>
        <div className="flex gap-2 text-sm">
          <ChevronRight className="size-4 shrink-0 text-accent mt-0.5" aria-hidden />
          <p className="text-foreground">
            <span className="font-semibold">Profitability:</span> High contribution
            items ({highContribNames}) are outside the eye-level zone. Relocate to
            Row 4.
          </p>
        </div>
      </section>

      {/* Top Unit Contribution */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Top Unit Contribution (Grouped by SKU)
          </h3>
        </div>
        <div className="space-y-2">
          {topContribItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card/50 px-3 py-2.5"
            >
              <div>
                <p className="font-medium text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.units} units
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-chart-2">
                  ${item.contribution.toFixed(2)}
                </p>
                <p className="text-[10px] text-muted-foreground">avg margin</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Space Efficiency vs Weight */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Space Efficiency vs Weight
          </h3>
        </div>
        <div className="relative rounded-lg border border-border bg-card/50 p-3">
          <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            className="w-full h-44"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Scatter plot of space efficiency vs weight"
          >
            {/* Axis lines */}
            <line
              x1={PADDING.left}
              y1={PADDING.top}
              x2={PADDING.left}
              y2={CHART_H - PADDING.bottom}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <line
              x1={PADDING.left}
              y1={CHART_H - PADDING.bottom}
              x2={CHART_W - PADDING.right}
              y2={CHART_H - PADDING.bottom}
              stroke="var(--border)"
              strokeWidth={1}
            />
            {/* Y-axis tick labels */}
            {Y_TICKS.map((val) => (
              <g key={`ytick-${val}`}>
                <line
                  x1={PADDING.left}
                  y1={toY(val)}
                  x2={PADDING.left - 4}
                  y2={toY(val)}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 6}
                  y={toY(val)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="var(--muted-foreground)"
                  style={{ fontSize: 9 }}
                >
                  {val}
                </text>
              </g>
            ))}
            {/* X-axis tick labels */}
            {X_TICKS.map((val) => (
              <g key={`xtick-${val}`}>
                <line
                  x1={toX(val)}
                  y1={CHART_H - PADDING.bottom}
                  x2={toX(val)}
                  y2={CHART_H - PADDING.bottom + 4}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
                <text
                  x={toX(val)}
                  y={CHART_H - PADDING.bottom + 14}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  style={{ fontSize: 9 }}
                >
                  {val}
                </text>
              </g>
            ))}
            {/* Axis titles */}
            <text
              x={PADDING.left + (CHART_W - PADDING.left - PADDING.right) / 2}
              y={CHART_H - 6}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              style={{ fontSize: 10, fontWeight: 500 }}
            >
              Weight (kg)
            </text>
            <text
              x={12}
              y={PADDING.top + (CHART_H - PADDING.top - PADDING.bottom) / 2}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              style={{ fontSize: 10, fontWeight: 500 }}
              transform={`rotate(-90, 12, ${PADDING.top + (CHART_H - PADDING.top - PADDING.bottom) / 2})`}
            >
              Contrib / SqFt
            </text>
            {/* Grid */}
            {X_TICKS.filter((x) => x > 0).map((x) => (
              <line
                key={`vx-${x}`}
                x1={toX(x)}
                y1={PADDING.top}
                x2={toX(x)}
                y2={CHART_H - PADDING.bottom}
                stroke="var(--border)"
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            ))}
            {Y_TICKS.filter((y) => y > 0).map((y) => (
              <line
                key={`hy-${y}`}
                x1={PADDING.left}
                y1={toY(y)}
                x2={CHART_W - PADDING.right}
                y2={toY(y)}
                stroke="var(--border)"
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
            ))}
            {/* Points */}
            {scatterData.map((d, i) => {
              const x = toX(Math.min(d.weight, X_MAX));
              const y = toY(Math.min(d.contribPerSqFt, Y_MAX));
              const isHovered =
                hoveredPoint?.productName === d.productName;
              return (
                <g
                  key={i}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      productName: d.productName,
                      weight: d.weight,
                      contribPerSqFt: d.contribPerSqFt,
                      unitMargin: d.contrib,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 5}
                    fill={isHovered ? "var(--chart-2)" : "var(--accent)"}
                    fillOpacity={isHovered ? 1 : 0.75}
                  />
                </g>
              );
            })}
          </svg>
          {hoveredPoint && (
            <div className="absolute inset-x-3 top-3 rounded-md border border-border bg-popover/95 backdrop-blur-md px-3 py-2 shadow-lg text-xs max-w-[180px] z-10">
              <p className="font-medium text-foreground">{hoveredPoint.productName}</p>
              <p className="text-muted-foreground mt-1">
                Weight: {hoveredPoint.weight.toFixed(1)} kg
              </p>
              <p className="text-muted-foreground">
                Contrib/SqFt: ${hoveredPoint.contribPerSqFt.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                Unit Margin: ${hoveredPoint.unitMargin.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Heavy Items Analysis */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Heavy Items Analysis
          </h3>
        </div>
        <div className="rounded-lg border border-border bg-card/40 px-4 py-3">
          {heavyItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {heavyItems.length} items &gt; {HEAVY_THRESHOLD_KG}kg detected.
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                {heavyItems.length} item{heavyItems.length !== 1 ? "s" : ""} &gt;{" "}
                {HEAVY_THRESHOLD_KG}kg detected.
              </p>
              {heavyItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-foreground">
                    {item.productName}
                  </span>
                  <span className="text-muted-foreground">
                    {item.weight.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
