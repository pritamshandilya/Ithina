import { LayoutGridIcon, Search, TableIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter, AuditQueueSort } from "@/types/checker-ui";
import { filterOptions, type ViewMode } from "./audit-review-queue.constants";

interface AuditReviewQueueToolbarProps {
  audits: CheckerAudit[];
  activeFilter: AuditQueueFilter;
  onFilterChange: (value: AuditQueueFilter) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: AuditQueueSort;
  onSortChange: (value: AuditQueueSort) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
}

export function AuditReviewQueueToolbar({
  audits,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: AuditReviewQueueToolbarProps) {
  return (
    <div className="shrink-0 space-y-3">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const count = option.count ? option.count(audits) : 0;
          const isActive = activeFilter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all border-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                isActive
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-border bg-card text-card-foreground hover:border-accent/50",
              )}
              aria-label={`Filter: ${option.label}`}
              aria-pressed={isActive}
            >
              <span>{option.label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold",
                    isActive ? "bg-accent text-white" : "bg-muted text-white",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search by shelf or submitter name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          aria-label="Search audits"
        />
      </div>

      <div className="mt-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as AuditQueueSort)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-card-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Sort audits"
          >
            <option value="compliance-asc">Lowest Compliance First</option>
            <option value="compliance-desc">Highest Compliance First</option>
            <option value="time-desc">Newest First</option>
            <option value="time-asc">Oldest First</option>
            <option value="violations-desc">Most Violations First</option>
            <option value="violations-asc">Least Violations First</option>
          </select>
        </div>
        <div className="flex rounded-lg border border-border p-0.5 bg-card" role="tablist" aria-label="Queue view mode">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "table"}
            onClick={() => onViewModeChange("table")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              viewMode === "table"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <TableIcon className="size-4" aria-hidden="true" />
            Table
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "card"}
            onClick={() => onViewModeChange("card")}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              viewMode === "card"
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <LayoutGridIcon className="size-4" aria-hidden="true" />
            Cards
          </button>
        </div>
      </div>
    </div>
  );
}
