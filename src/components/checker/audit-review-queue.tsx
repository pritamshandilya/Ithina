/**
 * Audit Review Queue Component
 * 
 * Main section of the Checker Dashboard displaying pending audits.
 * 
 * Features:
 * - Filter tabs (All, Critical, Needs Attention, Good, Vision, Assist)
 * - Sort options (Compliance, Time, Violations)
 * - Search by shelf ID or submitter name
 * - Grid of AuditQueueCard components
 * - Default sort: Lowest compliance first
 * - Loading states
 * - Empty states
 */

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";
import type { AuditQueueFilter, AuditQueueSort } from "@/features/checker/types";

import { AuditQueueCard } from "./audit-queue-card";

export interface AuditReviewQueueProps {
  /**
   * List of pending audits
   */
  audits?: CheckerAudit[];
  
  /**
   * Loading state
   */
  isLoading?: boolean;
  
  /**
   * Error state
   */
  error?: Error | null;
  
  /**
   * Click handler when an audit card is clicked
   */
  onAuditClick?: (auditId: string) => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Filter configuration with labels and count functions
 */
const filterOptions: {
  value: AuditQueueFilter;
  label: string;
  count?: (audits: CheckerAudit[]) => number;
}[] = [
  {
    value: "all",
    label: "All Pending",
    count: (audits) => audits.length,
  },
  {
    value: "critical",
    label: "Critical",
    count: (audits) => audits.filter((a) => (a.complianceScore || 0) < 50).length,
  },
  {
    value: "attention",
    label: "Needs Attention",
    count: (audits) => audits.filter((a) => {
      const score = a.complianceScore || 0;
      return score >= 50 && score < 80;
    }).length,
  },
  {
    value: "good",
    label: "Good",
    count: (audits) => audits.filter((a) => (a.complianceScore || 0) >= 80).length,
  },
  {
    value: "vision",
    label: "Vision Edge",
    count: (audits) => audits.filter((a) => a.mode === "vision-edge").length,
  },
  {
    value: "assist",
    label: "Assist Mode",
    count: (audits) => audits.filter((a) => a.mode === "assist-mode").length,
  },
];

/**
 * AuditReviewQueue Component
 * 
 * Displays filterable, sortable grid of pending audits.
 * Default sort: Lowest compliance score first (most critical at top).
 */
export function AuditReviewQueue({
  audits = [],
  isLoading,
  error,
  onAuditClick,
  className,
}: AuditReviewQueueProps) {
  const [activeFilter, setActiveFilter] = useState<AuditQueueFilter>("all");
  const [sortBy, setSortBy] = useState<AuditQueueSort>("compliance-asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and sort audits
  const filteredAndSortedAudits = useMemo(() => {
    if (!audits) return [];

    // Apply filters
    let filtered = audits;

    // Status filters
    if (activeFilter === "critical") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) < 50);
    } else if (activeFilter === "attention") {
      filtered = filtered.filter((a) => {
        const score = a.complianceScore || 0;
        return score >= 50 && score < 80;
      });
    } else if (activeFilter === "good") {
      filtered = filtered.filter((a) => (a.complianceScore || 0) >= 80);
    } else if (activeFilter === "vision") {
      filtered = filtered.filter((a) => a.mode === "vision-edge");
    } else if (activeFilter === "assist") {
      filtered = filtered.filter((a) => a.mode === "assist-mode");
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((audit) => {
        const shelfInfo = `aisle ${audit.shelfInfo.aisleNumber} bay ${audit.shelfInfo.bayNumber} ${audit.shelfInfo.shelfName}`.toLowerCase();
        const submitter = audit.submittedByName.toLowerCase();
        return shelfInfo.includes(query) || submitter.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "compliance-asc":
        sorted.sort((a, b) => (a.complianceScore || 0) - (b.complianceScore || 0));
        break;
      case "compliance-desc":
        sorted.sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));
        break;
      case "time-asc":
        sorted.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
        break;
      case "time-desc":
        sorted.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        break;
      case "violations-desc":
        sorted.sort((a, b) => b.violationCount - a.violationCount);
        break;
      case "violations-asc":
        sorted.sort((a, b) => a.violationCount - b.violationCount);
        break;
    }

    return sorted;
  }, [audits, activeFilter, sortBy, searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        
        {/* Card skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-lg bg-destructive/10 border border-destructive p-6", className)}>
        <p className="text-destructive font-semibold text-center">
          Failed to load audit queue
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Tabs and Search */}
      <div className="space-y-3">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const count = option.count ? option.count(audits) : 0;
            const isActive = activeFilter === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  "border-2 focus:outline-none focus:ring-2 focus:ring-offset-2",
                  isActive
                    ? "border-checker-primary shadow-sm"
                    : "border-border hover:border-checker-primary/50"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "color-mix(in oklch, var(--checker-primary) 15%, transparent)",
                        color: "var(--checker-primary)",
                        focusRing: "var(--checker-primary)",
                      }
                    : {
                        backgroundColor: "var(--card)",
                        color: "var(--card-foreground)",
                      }
                }
                aria-label={`Filter: ${option.label}`}
                aria-pressed={isActive}
              >
                <span>{option.label}</span>
                {count > 0 && (
                  <span
                    className="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      backgroundColor: isActive
                        ? "var(--checker-primary)"
                        : "var(--muted)",
                      color: "white",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" 
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search by shelf or submitter name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search audits"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as AuditQueueSort)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-card-foreground focus:outline-none focus:ring-2 focus:ring-checker-primary"
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

      {/* Audit Cards Grid */}
      {filteredAndSortedAudits.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-muted-foreground font-medium">
            {searchQuery.trim()
              ? `No audits found matching "${searchQuery}"`
              : `No ${activeFilter === "all" ? "pending" : filterOptions.find((f) => f.value === activeFilter)?.label.toLowerCase()} audits`}
          </p>
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-sm underline"
              style={{ color: "var(--checker-primary)" }}
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedAudits.map((audit) => (
              <AuditQueueCard
                key={audit.id}
                audit={audit}
                onClick={onAuditClick}
              />
            ))}
          </div>
          
          {/* Result Count */}
          <p className="text-sm text-muted-foreground text-center">
            Showing {filteredAndSortedAudits.length} of {audits.length} audits
          </p>
        </>
      )}
    </div>
  );
}
