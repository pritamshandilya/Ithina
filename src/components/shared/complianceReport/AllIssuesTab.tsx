/**
 * All Issues Tab
 *
 * Collapsible issue categories with search and filter.
 * Data is provided by report container.
 */
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  Layers,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import type {
  AllIssuesReportData,
  IssueCategoryGroup,
  IssueCategoryVariant,
  IssueEntry,
} from "@/lib/analysis/allIssuesReportTypes";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<IssueCategoryVariant, string> = {
  misplaced:
    "bg-action-warning/15 border-action-warning/40 text-action-warning",
  missing: "bg-destructive/15 border-destructive/40 text-destructive",
  extra: "bg-blue-500/15 border-blue-500/40 text-blue-500",
  depth: "bg-teal-500/15 border-teal-500/40 text-teal-500",
  analysis: "bg-accent/15 border-accent/40 text-accent",
};

const VARIANT_ICONS: Record<
  IssueCategoryVariant,
  React.ComponentType<{ className?: string }>
> = {
  misplaced: AlertTriangle,
  missing: XCircle,
  extra: Package,
  depth: Layers,
  analysis: BarChart3,
};

function severityBadge(severity: string) {
  const color =
    severity === "LOW"
      ? "bg-chart-2/20 text-chart-2 border-chart-2/40"
      : severity === "MEDIUM"
        ? "bg-action-warning/20 text-action-warning border-action-warning/40"
        : "bg-destructive/20 text-destructive border-destructive/40";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-medium",
        color,
      )}
    >
      {severity}
    </span>
  );
}

function filterCategories(
  categories: IssueCategoryGroup[],
  activeFilter: IssueCategoryVariant | "all",
  searchQuery: string,
): IssueCategoryGroup[] {
  let filtered = categories;

  if (activeFilter !== "all") {
    filtered = filtered.filter((c) => c.variant === activeFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered
      .map((cat) => ({
        ...cat,
        issues: cat.issues.filter(
          (i) =>
            i.productName.toLowerCase().includes(q) ||
            (i.sku?.toLowerCase().includes(q) ?? false) ||
            i.description.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.issues.length > 0);
  }

  return filtered;
}

export interface AllIssuesTabProps {
  /** Report data */
  data?: AllIssuesReportData | null;
  /** PDF export mode: hide search/filters, expand all categories */
  pdfMode?: boolean;
  className?: string;
}

export function AllIssuesTab({
  data = null,
  pdfMode = false,
  className,
}: AllIssuesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    IssueCategoryVariant | "all"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = data?.categories ?? [];

  const filteredCategories = useMemo(
    () => filterCategories(categories, activeFilter, searchQuery),
    [categories, activeFilter, searchQuery],
  );

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filterButtons: {
    key: IssueCategoryVariant | "all";
    label: string;
    count?: number;
  }[] = [
    { key: "all", label: "All" },
    {
      key: "misplaced",
      label: "Misplaced",
      count: categories.find((c) => c.variant === "misplaced")?.count ?? 0,
    },
    {
      key: "missing",
      label: "Missing",
      count: categories.find((c) => c.variant === "missing")?.count ?? 0,
    },
    {
      key: "extra",
      label: "Extra",
      count: categories.find((c) => c.variant === "extra")?.count ?? 0,
    },
    {
      key: "analysis",
      label: "Analysis Issues",
      count: categories.find((c) => c.variant === "analysis")?.count ?? 0,
    },
  ];

  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      {!data && (
        <div className="border-border bg-card/60 text-muted-foreground rounded-xl border p-6 text-center">
          <p className="text-sm">No data available.</p>
        </div>
      )}
      {/* Search – hidden in PDF mode */}
      {!pdfMode && (
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search products, SKUs, or issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card pl-9"
          />
        </div>
      )}

      {/* Filter buttons – hidden in PDF mode */}
      {!pdfMode && (
        <div className="flex flex-wrap gap-2">
          {filterButtons.map(({ key, label, count }) => {
            const isActive = activeFilter === key;
            const variantStyle =
              key !== "all"
                ? VARIANT_STYLES[key as IssueCategoryVariant]
                : null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive &&
                    key === "all" &&
                    "border-accent bg-accent/20 text-accent",
                  isActive && key !== "all" && variantStyle,
                  !isActive &&
                    key !== "all" &&
                    "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
                  !isActive &&
                    key === "all" &&
                    "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                {count != null ? `${count} ${label}` : label}
              </button>
            );
          })}
        </div>
      )}

      {/* Collapsible categories */}
      <div className="space-y-2">
        {filteredCategories.map((category) => {
          const Icon = VARIANT_ICONS[category.variant];
          const styles = VARIANT_STYLES[category.variant];
          const isExpanded = pdfMode || expandedId === category.id;

          return (
            <div
              key={category.id}
              className="border-border bg-card/60 overflow-hidden rounded-xl border"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(category.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-90",
                  isExpanded && "border-border border-b",
                  styles,
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="text-foreground font-semibold">
                  {category.title} {category.issues.length}
                </span>
                <span className="text-muted-foreground flex-1 truncate text-sm">
                  {category.description}
                </span>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
                    !isExpanded && "-rotate-90",
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="divide-border divide-y">
                    {category.issues.map((issue: IssueEntry) => (
                      <div
                        key={issue.id}
                        className="bg-card/40 hover:bg-card/60 px-4 py-3 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-foreground font-medium">
                                {issue.productName}
                              </span>
                              {issue.sku && (
                                <span className="text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5 text-xs">
                                  {issue.sku}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {issue.description}
                            </p>
                            {issue.detail && (
                              <p className="text-muted-foreground text-xs">
                                {issue.detail}
                              </p>
                            )}
                            {issue.metrics && (
                              <p className="text-foreground/80 text-xs font-medium">
                                {issue.metrics}
                              </p>
                            )}
                            {issue.why && (
                              <p className="text-muted-foreground text-xs italic">
                                Why: {issue.why}
                              </p>
                            )}
                          </div>
                          {severityBadge(issue.severity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="border-border bg-card/60 text-muted-foreground rounded-xl border p-6 text-center">
          <p className="text-sm">No data available.</p>
        </div>
      )}
    </div>
  );
}
