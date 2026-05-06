import { LayoutGridIcon, Search, TableIcon } from "lucide-react";

import { type ViewMode, filterOptions } from "./auditReviewQueue.constants";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter, AuditQueueSort } from "@/types/checkerUi";

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
                "focus:ring-accent inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none",
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
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
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

      <div className="mt-3 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as AuditQueueSort)}
            className="border-border bg-card text-card-foreground focus:ring-accent rounded-md border px-3 py-1.5 focus:ring-2 focus:outline-none"
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
        <div
          className="border-border bg-card flex rounded-lg border p-0.5"
          role="tablist"
          aria-label="Queue view mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "table"}
            onClick={() => onViewModeChange("table")}
            className={cn(
              "focus-visible:ring-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none",
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
              "focus-visible:ring-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:outline-none",
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
