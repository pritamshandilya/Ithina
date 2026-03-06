/**
 * All Issues Tab
 *
 * Collapsible issue categories with search and filter.
 * Uses mock data – replace with API when available.
 */

import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  AlertTriangle,
  XCircle,
  Package,
  Layers,
  BarChart3,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MOCK_ALL_ISSUES_REPORT } from "@/lib/analysis/mock-all-issues-report";
import type {
  AllIssuesReportData,
  IssueCategoryGroup,
  IssueEntry,
  IssueCategoryVariant,
} from "@/lib/analysis/all-issues-report-types";
import { cn } from "@/lib/utils";

const VARIANT_STYLES: Record<IssueCategoryVariant, string> = {
  misplaced:
    "bg-action-warning/15 border-action-warning/40 text-action-warning",
  missing: "bg-destructive/15 border-destructive/40 text-destructive",
  extra: "bg-blue-500/15 border-blue-500/40 text-blue-500",
  depth: "bg-teal-500/15 border-teal-500/40 text-teal-500",
  analysis: "bg-accent/15 border-accent/40 text-accent",
};

const VARIANT_ICONS: Record<IssueCategoryVariant, React.ComponentType<{ className?: string }>> = {
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
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border shrink-0",
        color
      )}
    >
      {severity}
    </span>
  );
}

function filterCategories(
  categories: IssueCategoryGroup[],
  activeFilter: IssueCategoryVariant | "all",
  searchQuery: string
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
            i.description.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.issues.length > 0);
  }

  return filtered;
}

export interface AllIssuesTabProps {
  /** Report data – defaults to mock; pass from API when available */
  data?: AllIssuesReportData;
  /** PDF export mode: hide search/filters, expand all categories */
  pdfMode?: boolean;
  className?: string;
}

export function AllIssuesTab({
  data = MOCK_ALL_ISSUES_REPORT,
  pdfMode = false,
  className,
}: AllIssuesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<IssueCategoryVariant | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCategories = useMemo(
    () => filterCategories(data.categories, activeFilter, searchQuery),
    [data.categories, activeFilter, searchQuery]
  );

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filterButtons: { key: IssueCategoryVariant | "all"; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    {
      key: "misplaced",
      label: "Misplaced",
      count: data.categories.find((c) => c.variant === "misplaced")?.count ?? 0,
    },
    {
      key: "missing",
      label: "Missing",
      count: data.categories.find((c) => c.variant === "missing")?.count ?? 0,
    },
    {
      key: "extra",
      label: "Extra",
      count: data.categories.find((c) => c.variant === "extra")?.count ?? 0,
    },
    {
      key: "analysis",
      label: "Analysis Issues",
      count: data.categories.find((c) => c.variant === "analysis")?.count ?? 0,
    },
  ];

  return (
    <div className={cn("w-full min-w-0 space-y-4", className)}>
      {/* Search – hidden in PDF mode */}
      {!pdfMode && (
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search products, SKUs, or issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card"
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
                isActive && key === "all" && "border-accent bg-accent/20 text-accent",
                isActive && key !== "all" && variantStyle,
                !isActive &&
                  key !== "all" &&
                  "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground",
                !isActive && key === "all" && "border-border bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
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
              className="rounded-xl border border-border bg-card/60 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleExpanded(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:opacity-90",
                  isExpanded && "border-b border-border",
                  styles
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                <span className="font-semibold text-foreground">
                  {category.title} {category.issues.length}
                </span>
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {category.description}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    !isExpanded && "-rotate-90"
                  )}
                  aria-hidden
                />
              </button>

              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="divide-y divide-border">
                    {category.issues.map((issue: IssueEntry) => (
                    <div
                      key={issue.id}
                      className="px-4 py-3 bg-card/40 hover:bg-card/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">
                              {issue.productName}
                            </span>
                            {issue.sku && (
                              <span className="text-xs text-muted-foreground rounded bg-muted/50 px-1.5 py-0.5">
                                {issue.sku}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {issue.description}
                          </p>
                          {issue.detail && (
                            <p className="text-xs text-muted-foreground">
                              {issue.detail}
                            </p>
                          )}
                          {issue.metrics && (
                            <p className="text-xs text-foreground/80 font-medium">
                              {issue.metrics}
                            </p>
                          )}
                          {issue.why && (
                            <p className="text-xs text-muted-foreground italic">
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
        <div className="rounded-xl border border-border bg-card/60 p-6 text-center text-muted-foreground">
          <p className="text-sm">No issues match your search.</p>
        </div>
      )}
    </div>
  );
}
