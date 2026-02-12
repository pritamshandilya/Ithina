import { formatDistanceToNow } from "date-fns";
import { AlertTriangleIcon, RefreshCwIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignedShelves, useReturnedAudits } from "@/features/maker/hooks";
import { cn } from "@/lib/utils";

/**
 * Props for the ReturnedAuditsSection component
 */
export interface ReturnedAuditsSectionProps {
  onResubmit?: (auditId: string, shelfId: string) => void;
  className?: string;
}

/**
 * ReturnedAuditsSection Component
 * 
 * Displays audits that have been rejected by checkers and require resubmission.
 * This is a critical component for the governance loop - it ensures workers
 * can quickly identify and fix issues found during the checking process.
 * 
 * Features:
 * - Only shows when returned audits exist (conditional rendering)
 * - Warning/alert styling to draw attention
 * - Displays rejection reason from checker
 * - Shows relative time of rejection
 * - "Re-Submit Audit" action button
 * - Links shelf information for context
 * - Loading and error states
 * 
 * Design Philosophy:
 * - Visibility: Should be immediately noticeable (warning colors)
 * - Clarity: Rejection reasons must be clear and actionable
 * - Urgency: Visual design conveys "needs attention"
 * - Context: Links to shelf details for quick reference
 * 
 * @example
 * ```tsx
 * <ReturnedAuditsSection 
 *   onResubmit={(auditId, shelfId) => {
 *     navigate({ to: '/maker/audit/$id/edit', params: { id: auditId }})
 *   }}
 * />
 * ```
 */
export function ReturnedAuditsSection({
  onResubmit,
  className,
}: ReturnedAuditsSectionProps) {
  const { data: returnedAudits = [], isLoading, error } = useReturnedAudits();
  const { data: shelves } = useAssignedShelves();

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
      <div className="flex items-center gap-3">
        <AlertTriangleIcon
          className="size-6 shrink-0"
          style={{ color: "var(--maker-returned)" }}
          aria-hidden="true"
        />
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--maker-returned)" }}
          >
            Audits Requiring Attention
          </h2>
          <p className="text-sm text-muted-foreground">
            {returnedAudits.length} audit{returnedAudits.length !== 1 ? "s" : ""}{" "}
            returned by checker - please review and resubmit
          </p>
        </div>
      </div>

      <Separator />

      {/* Returned Audits List */}
      <div className="space-y-3">
        {returnedAudits.map((audit) => {
          // Find the corresponding shelf for context
          const shelf = shelves?.find((s) => s.id === audit.shelfId);

          return (
            <div
              key={audit.id}
              className="rounded-lg bg-card border border-border p-4 space-y-3 transition-all hover:border-border/80"
            >
              {/* Header: Shelf Info + Timestamp */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {shelf ? (
                      <>
                        {shelf.shelfName}
                        <span className="text-sm text-muted-foreground font-normal ml-2">
                          (Aisle {shelf.aisleNumber}, Bay {shelf.bayNumber})
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Shelf {audit.shelfId}</span>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Returned{" "}
                    {audit.rejectedAt &&
                      formatDistanceToNow(new Date(audit.rejectedAt), {
                        addSuffix: true,
                      })}
                  </p>
                </div>
                <XCircleIcon
                  className="size-5 shrink-0"
                  style={{ color: "var(--maker-returned)" }}
                  aria-hidden="true"
                />
              </div>

              {/* Rejection Reason */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-semibold text-card-foreground mb-1">
                  Checker's Feedback:
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {audit.rejectionReason || "No reason provided"}
                </p>
              </div>

              {/* Compliance Score (if available) */}
              {audit.complianceScore !== undefined && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Original Score:</span>
                  <span
                    className="font-semibold"
                    style={{ color: "var(--maker-returned)" }}
                  >
                    {audit.complianceScore}%
                  </span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  size="sm"
                  className="w-full sm:w-auto gap-2"
                  style={{
                    backgroundColor: "var(--maker-primary)",
                    color: "var(--accent-foreground)",
                  }}
                  onClick={() => onResubmit?.(audit.id, audit.shelfId)}
                  aria-label={`Resubmit audit for ${shelf?.shelfName || 'shelf'}`}
                >
                  <RefreshCwIcon className="size-4" aria-hidden="true" />
                  Re-Submit Audit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          💡 Review the checker's feedback carefully before resubmitting. Make sure to
          address all concerns mentioned above.
        </p>
      </div>
    </div>
  );
}
