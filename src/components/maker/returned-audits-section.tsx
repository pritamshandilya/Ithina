import { formatDistanceToNow } from "date-fns";
import { AlertCircleIcon, FileTextIcon, ImageIcon, ChevronRightIcon, ClockIcon } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useShelves, useReturnedAudits } from "@/queries/maker";
import { cn } from "@/lib/utils";

/**
 * Props for the ReturnedAuditsSection component
 */
export interface ReturnedAuditsSectionProps {
  onViewReport?: (auditId: string, shelfId: string) => void;
  className?: string;
}

/**
 * ReturnedAuditsSection Component
 * 
 * Displays audits that have been rejected by checkers and require attention.
 * This is a critical component for the governance loop - it enables workers
 * to review detailed feedback reports before taking corrective action.
 * 
 * Features:
 * - Only shows when returned audits exist (conditional rendering)
 * - Alert styling to draw immediate attention
 * - Preview of rejection reason from checker
 * - Visual indicators for report contents (photos, planogram, detailed feedback)
 * - "View Full Report" action to see complete details
 * - Shows relative time since rejection
 * - Compliance score indicator
 * - Loading and error states
 * 
 * Design Philosophy:
 * - Information First: Workers need to review full report before acting
 * - Visual Clarity: Card-based layout with clear hierarchy
 * - Context Rich: Preview key info, link to detailed report
 * - Actionable: Clear path to view full feedback and planogram
 * 
 * Future Report Contents:
 * - Detailed checker comments with annotations
 * - Photo evidence of issues
 * - Planogram comparison (expected vs actual)
 * - Specific violations list
 * - Corrective action suggestions
 * 
 * @example
 * ```tsx
 * <ReturnedAuditsSection 
 *   onViewReport={(auditId, shelfId) => {
 *     navigate({ to: '/maker/report/$id', params: { id: auditId }})
 *   }}
 * />
 * ```
 */
export function ReturnedAuditsSection({
  onViewReport,
  className,
}: ReturnedAuditsSectionProps) {
  const { data: returnedAudits = [], isLoading, error } = useReturnedAudits();
  const { data: shelves } = useShelves();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border p-6 space-y-4", className)}
        style={{
          backgroundColor: "color-mix(in oklch, var(--maker-returned) 5%, var(--card))",
          borderColor: "color-mix(in oklch, var(--maker-returned) 30%, transparent)",
        }}
      >
        <Skeleton className="h-6 w-64" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-card p-4 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-32" />
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
          Failed to load returned audits
        </p>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {(error as Error).message}
        </p>
      </div>
    );
  }

  // No returned audits - don't show the section at all
  if (returnedAudits.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("rounded-lg border p-6 space-y-4", className)}
      style={{
        backgroundColor: "color-mix(in oklch, var(--maker-returned) 5%, var(--card))",
        borderColor: "color-mix(in oklch, var(--maker-returned) 30%, transparent)",
      }}
      role="region"
      aria-label="Returned audits requiring attention"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-destructive/20 p-2 mt-0.5">
          <AlertCircleIcon
            className="size-6 shrink-0 text-destructive"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-destructive">
            Audits Requiring Attention
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {returnedAudits.length} audit{returnedAudits.length !== 1 ? "s" : ""}{" "}
            returned with feedback — review report{returnedAudits.length !== 1 ? "s" : ""} to understand required corrections
          </p>
        </div>
        {returnedAudits.length > 0 && (
          <div className="rounded-full bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold tabular-nums">
            {returnedAudits.length}
          </div>
        )}
      </div>

      <Separator />

      {/* Returned Audits List */}
      <div className="space-y-4">
        {returnedAudits.map((audit) => {
          // Find the corresponding shelf for context
          const shelf = shelves?.find((s) => s.id === audit.shelfId);

          return (
            <div
              key={audit.id}
              className="rounded-lg bg-card border-2 border-destructive/30 p-5 space-y-4 transition-all hover:border-destructive/50 hover:shadow-lg cursor-pointer group"
              onClick={() => onViewReport?.(audit.id, audit.shelfId)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onViewReport?.(audit.id, audit.shelfId);
                }
              }}
              aria-label={`View detailed feedback report for ${shelf?.shelfName || 'shelf'}`}
            >
              {/* Header: Shelf Info + Score Badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {shelf ? (
                      <>
                        {shelf.shelfName}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Shelf {audit.shelfId}</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Aisle{" "}
                      {shelf?.aisleCode ??
                        (shelf?.aisleNumber != null
                          ? `A${shelf.aisleNumber}`
                          : "?")}{" "}
                      · Bay{" "}
                      {shelf?.bayCode ?? (shelf?.bayNumber != null ? String(shelf.bayNumber) : "?")}
                    </span>
                    <span>·</span>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="h-3.5 w-3.5" />
                      Returned{" "}
                      {audit.rejectedAt &&
                        formatDistanceToNow(new Date(audit.rejectedAt), {
                          addSuffix: true,
                        })}
                    </div>
                  </div>
                </div>
                
                {/* Compliance Score Badge */}
                {audit.complianceScore !== undefined && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="rounded-lg bg-destructive/20 px-3 py-1.5 border border-destructive/40">
                      <span className="text-2xl font-bold text-destructive tabular-nums">
                        {audit.complianceScore}%
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Score
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback Preview */}
              <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <FileTextIcon className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Feedback Summary:
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {audit.rejectionReason || "No feedback provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Contents Indicators */}
              <div className="flex items-center gap-4 pt-2 pb-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="rounded-full bg-accent/20 p-1.5">
                    <FileTextIcon className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <span>Detailed Report</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="rounded-full bg-chart-2/20 p-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-chart-2" />
                  </div>
                  <span>Photo Evidence</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="rounded-full bg-chart-1/20 p-1.5">
                    <svg className="h-3.5 w-3.5 text-chart-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 010 2H6v2a1 1 0 01-2 0V5zM20 5a1 1 0 00-1-1h-4a1 1 0 100 2h2v2a1 1 0 102 0V5zM4 19a1 1 0 001 1h4a1 1 0 100-2H6v-2a1 1 0 10-2 0v3zM20 19a1 1 0 01-1 1h-4a1 1 0 110-2h2v-2a1 1 0 112 0v3z" />
                    </svg>
                  </div>
                  <span>Planogram</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-border/50">
                <button
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                    "bg-accent text-white hover:bg-accent/90",
                    "group-hover:bg-accent/95 group-hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewReport?.(audit.id, audit.shelfId);
                  }}
                  aria-label={`View full feedback report for ${shelf?.shelfName || 'shelf'}`}
                >
                  <FileTextIcon className="h-4 w-4" aria-hidden="true" />
                  View Full Report
                  <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="rounded-lg bg-accent/10 border border-accent/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/20 p-1 mt-0.5">
            <svg className="h-4 w-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">
              What to expect in the full report:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Detailed checker comments with specific sections highlighted</li>
              <li>Photo evidence showing identified issues</li>
              <li>Side-by-side planogram comparison (expected vs actual)</li>
              <li>Step-by-step corrective action guidance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
