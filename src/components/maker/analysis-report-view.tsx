/**
 * Analysis Report View
 *
 * Two-column layout shown after pipeline completes:
 * - Left: Shelf View (image + controls)
 * - Right: Analysis Report with tabs (SKU List, Compliance, Strategy & Optimization)
 */

import { useState } from "react";
import {
  BarChart3,
  Camera,
  Check,
  Eye,
  List,
  RefreshCw,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SkuEnrichmentItem } from "@/features/maker/analysis";

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
            />
          )}
          {activeTab === "compliance" && <ComplianceTab />}
          {activeTab === "strategy" && <StrategyTab />}
        </div>
      </section>
    </div>
  );
}

function SkuListTab({
  skuItems,
  skuQuantities,
  skuIssues,
}: {
  skuItems: SkuEnrichmentItem[];
  skuQuantities: Record<string, number>;
  skuIssues: Record<string, number>;
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
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-destructive/20 text-destructive px-2 py-0.5 text-xs font-medium">
                        {issues} issue{issues !== 1 ? "s" : ""}
                      </span>
                    )}
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

function ComplianceTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Compliance analysis will be displayed here.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
        Placeholder for Compliance tab content
      </div>
    </div>
  );
}

function StrategyTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Strategy and optimization recommendations will be displayed here.
      </p>
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
        Placeholder for Strategy & Optimization tab content
      </div>
    </div>
  );
}
