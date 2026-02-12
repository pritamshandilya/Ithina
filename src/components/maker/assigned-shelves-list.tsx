import { useState, useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedShelves } from "@/features/maker/hooks";
import { cn } from "@/lib/utils";
import type { AuditStatus, Shelf } from "@/types/maker";

import { ShelfCard } from "./shelf-card";

/**
 * Props for the AssignedShelvesList component
 */
export interface AssignedShelvesListProps {
  onShelfClick?: (shelfId: string) => void;
  className?: string;
}

/**
 * Filter option type
 */
type FilterOption = "all" | AuditStatus;

/**
 * Filter options configuration
 */
const filterOptions: { value: FilterOption; label: string; count?: (shelves: Shelf[]) => number }[] = [
  {
    value: "all",
    label: "All Shelves",
    count: (shelves) => shelves.length,
  },
  {
    value: "draft",
    label: "Draft",
    count: (shelves) => shelves.filter((s) => s.status === "draft").length,
  },
  {
    value: "never-audited",
    label: "Never Audited",
    count: (shelves) => shelves.filter((s) => s.status === "never-audited").length,
  },
  {
    value: "pending",
    label: "Pending Review",
    count: (shelves) => shelves.filter((s) => s.status === "pending").length,
  },
  {
    value: "returned",
    label: "Returned",
    count: (shelves) => shelves.filter((s) => s.status === "returned").length,
  },
  {
    value: "approved",
    label: "Approved",
    count: (shelves) => shelves.filter((s) => s.status === "approved").length,
  },
];

/**
 * AssignedShelvesList Component
 * 
 * Displays a filterable grid of assigned shelves with status indicators.
 * 
 * Features:
 * - Filter by status (All, Never Audited, Pending, Returned, Approved)
 * - Responsive grid layout (1→2→3 columns)
 * - Loading skeletons
 * - Empty states
 * - Error handling
 * - Click handler support
 * 
 * @example
 * ```tsx
 * <AssignedShelvesList 
 *   onShelfClick={(id) => navigate(`/shelf/${id}`)}
 * />
 * ```
 */
export function AssignedShelvesList({
  onShelfClick,
  className,
}: AssignedShelvesListProps) {
  const { data: shelves, isLoading, error } = useAssignedShelves();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  // Filter shelves based on active filter
  const filteredShelves = useMemo(() => {
    if (!shelves) return [];
    if (activeFilter === "all") return shelves;
    return shelves.filter((shelf) => shelf.status === activeFilter);
  }, [shelves, activeFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Filter skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-28 shrink-0" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="dashboard-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg bg-card border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg bg-destructive/10 border border-destructive p-6 text-center">
          <p className="text-destructive font-semibold">
            Failed to load assigned shelves
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!shelves || shelves.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="rounded-lg bg-card border border-border p-12 text-center">
          <p className="text-lg font-semibold text-card-foreground">
            No Shelves Assigned
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            You don't have any shelves assigned yet. Contact your manager to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filterOptions.map((option) => {
          const count = option.count ? option.count(shelves) : 0;
          const isActive = activeFilter === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0",
                "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-accent text-accent-foreground border-accent shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-accent/50 hover:text-accent-foreground"
              )}
              aria-pressed={isActive}
              aria-label={`Filter by ${option.label}, ${count} shelves`}
            >
              {option.label}
              <span className="ml-2 text-xs opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filtered Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredShelves.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {shelves.length}
          </span>{" "}
          shelves
        </p>
      </div>

      {/* Shelves Grid */}
      {filteredShelves.length === 0 ? (
        <div className="rounded-lg bg-card border border-border p-8 text-center">
          <p className="text-muted-foreground">
            No shelves found with status:{" "}
            <span className="font-semibold text-foreground">
              {filterOptions.find((o) => o.value === activeFilter)?.label}
            </span>
          </p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {filteredShelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              onClick={onShelfClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
