
import { useMemo, useState } from "react";
import { LayoutGridIcon, Search, TableIcon, AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useDraftAudits, useReturnedAudits } from "@/features/maker/hooks";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Audit, AuditStatus } from "@/types/maker";
import { Button } from "@/components/ui/button";

export interface AuditReviewQueueProps {
  className?: string;
  onAction?: (auditId: string, action: "resume" | "fix") => void;
}

type FilterType = "all" | "returned" | "draft";

// Helper to get shelf display name
const getShelfName = (audit: Audit) => {
  // In a real app, we might need to fetch shelf details or have them included in the audit object
  // For now, using the shelfId as a placeholder or assuming it's available
  return `Shelf ${audit.shelfId}`; 
  // TODO: Update mock data or type to include shelf info like 'aisle', 'bay', etc.
};

export function AuditReviewQueue({ className, onAction }: AuditReviewQueueProps) {
  const { data: draftAudits, isLoading: isDraftsLoading } = useDraftAudits();
  const { data: returnedAudits, isLoading: isReturnedLoading } = useReturnedAudits();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  const isLoading = isDraftsLoading || isReturnedLoading;

  const allAudits = useMemo(() => {
    const drafts = draftAudits || [];
    const returned = returnedAudits || [];
    return [...drafts, ...returned];
  }, [draftAudits, returnedAudits]);

  const filteredAudits = useMemo(() => {
    let result = allAudits;

    // Filter by type
    if (activeFilter === "returned") {
      result = result.filter((a) => a.status === "returned");
    } else if (activeFilter === "draft") {
      result = result.filter((a) => a.status === "draft");
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((a) => 
        a.shelfId.toLowerCase().includes(query) || 
        a.id.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return result.sort((a, b) => {
      const dateA = new Date(a.submittedAt || a.draftSavedAt || 0).getTime();
      const dateB = new Date(b.submittedAt || b.draftSavedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [allAudits, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Fitlers */}
        <div className="flex gap-2">
          <FilterButton 
            label="All Needs Attention" 
            count={allAudits.length} 
            isActive={activeFilter === "all"} 
            onClick={() => setActiveFilter("all")} 
          />
          <FilterButton 
            label="Returned" 
            count={(returnedAudits || []).length} 
            isActive={activeFilter === "returned"} 
            onClick={() => setActiveFilter("returned")} 
            variant="returned"
          />
          <FilterButton 
            label="Drafts" 
            count={(draftAudits || []).length} 
            isActive={activeFilter === "draft"} 
            onClick={() => setActiveFilter("draft")} 
            variant="draft"
          />
        </div>

        {/* Search and View Toggle */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex border border-border rounded-lg bg-card p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md", viewMode === "table" && "bg-accent text-accent-foreground")}
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-md", viewMode === "card" && "bg-accent text-accent-foreground")}
              onClick={() => setViewMode("card")}
            >
              <LayoutGridIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredAudits.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-card/50">
          <p className="text-muted-foreground">No audits found matching your criteria.</p>
        </div>
      ) : (
        <div className={cn(
          viewMode === "card" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-2"
        )}>
          {filteredAudits.map((audit) => (
            <AuditCard 
              key={audit.id} 
              audit={audit} 
              viewMode={viewMode}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Sub-components

function FilterButton({ 
  label, 
  count, 
  isActive, 
  onClick,
  variant = "default" 
}: { 
  label: string; 
  count: number; 
  isActive: boolean; 
  onClick: () => void;
  variant?: "default" | "returned" | "draft";
}) {
  /* 
    Updated High-Contrast Active States:
    - Default: Solid ACCENT (Purple) background for clear "selected" state.
    - Returned: Solid destructive background.
    - Draft: Solid secondary/accent background.
  */
  const variantStyles = {
    default: "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/25",
    returned: "border-destructive bg-destructive text-destructive-foreground shadow-md shadow-destructive/25",
    draft: "border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20",
  };

  const activeClass = isActive 
    ? variantStyles[variant]
    : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
        isActive ? "scale-105" : "hover:scale-102",
        activeClass
      )}
    >
      {label}
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
        isActive 
          ? "bg-black/20 text-current" 
          : "bg-background/20 text-current group-hover:bg-background/30"
      )}>
        {count}
      </span>
    </button>
  );
}




function AuditCard({ 
  audit, 
  viewMode, 
  onAction 
}: { 
  audit: Audit; 
  viewMode: "card" | "table";
  onAction?: (auditId: string, action: "resume" | "fix") => void;
}) {
  const isReturned = audit.status === "returned";
  const date = audit.submittedAt || audit.draftSavedAt;
  
  const content = (
    <>
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-semibold text-lg">{getShelfName(audit)}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="size-3" />
            {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : "Unknown date"}
          </p>
        </div>
        <StatusBadge status={audit.status} />
      </div>

      {isReturned && audit.rejectionReason && (
        <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm text-destructive-foreground">
          <p className="font-medium flex items-center gap-2">
            <AlertTriangle className="size-4" />
            Correction Needed
          </p>
          <p className="mt-1 opacity-90 line-clamp-2">{audit.rejectionReason}</p>
        </div>
      )}

      {audit.status === "draft" && (
         <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{audit.draftProgress || 0}%</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${audit.draftProgress || 0}%` }}
              />
            </div>
         </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex justify-end">
        <Button 
          variant={isReturned ? "destructive" : "default"}
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => onAction?.(audit.id, isReturned ? "fix" : "resume")}
        >
          {isReturned ? "Fix Issues" : "Resume Audit"}
        </Button>
      </div>
    </>
  );

  if (viewMode === "table") {
    // Determine status color for table row left border or indicator
    const borderClass = isReturned ? "border-l-4 border-l-destructive" : "border-l-4 border-l-primary/50";
    
    return (
      <div className={cn("flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors", borderClass)}>
        <div className="flex items-center gap-4">
           <div>
            <p className="font-medium">{getShelfName(audit)}</p>
            <p className="text-xs text-muted-foreground">
              {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : ""}
            </p>
           </div>
           {isReturned && (
             <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded max-w-[200px] truncate hidden sm:inline-block">
               {audit.rejectionReason}
             </span>
           )}
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge status={audit.status} />
          <Button 
            size="sm" 
            variant={isReturned ? "destructive" : "outline"}
            onClick={() => onAction?.(audit.id, isReturned ? "fix" : "resume")}
          >
            {isReturned ? "Fix" : "Resume"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-5 rounded-lg border bg-card hover:shadow-md transition-all flex flex-col",
      isReturned ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"
    )}>
      {content}
    </div>
  );
}

function StatusBadge({ status }: { status: AuditStatus }) {
  if (status === "returned") {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
        Returned
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary-foreground text-foreground">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
      {status}
    </span>
  );
}
