/**
 * Publishing Status Panel Component
 *
 * Displays recently published audits and their event bus publishing status.
 * Reflects ROL Event Bus integration for Phase 1 stability.
 *
 * Features:
 * - List of recently published audits
 * - Publishing status (Published, Failed, Pending)
 * - Status badges with color coding
 * - Retry button for failed publishes
 * - Timestamps for audit tracking
 * - Empty state when no published audits
 *
 * Status Colors:
 * - Published: Green (success)
 * - Failed: Red (destructive)
 * - Pending: Gray (neutral)
 *
 * Integration:
 * - Uses usePublishedAudits hook
 * - Will integrate with retry mutation in Phase 2
 */
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle, Clock, RefreshCw, Send, XCircle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";
import { usePublishedAudits } from "@/queries/checker";
import type { PublishedAudit } from "@/types/checker";

export interface PublishingStatusPanelProps {
  /**
   * The store ID to fetch published audits for
   */
  storeId: string;

  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * Get status icon based on publishing status
 */
function getStatusIcon(status: PublishedAudit["status"]) {
  switch (status) {
    case "published":
      return CheckCircle;
    case "failed":
      return XCircle;
    case "pending":
      return Clock;
    default:
      return Clock;
  }
}

/**
 * Get status color based on publishing status
 */
function getStatusColor(status: PublishedAudit["status"]) {
  switch (status) {
    case "published":
      return "text-chart-2 bg-chart-2/10";
    case "failed":
      return "text-destructive bg-destructive/10";
    case "pending":
      return "text-muted-foreground bg-muted/10";
    default:
      return "text-muted-foreground bg-muted";
  }
}

export function PublishingStatusPanel({
  storeId,
  className = "",
}: PublishingStatusPanelProps) {
  const { toast } = useToast();
  const { data: audits, isLoading, error } = usePublishedAudits(storeId);

  // Handle retry (placeholder for Phase 2)
  const handleRetry = (_auditId: string) => {
    toast({
      title: "Coming soon",
      description: "Retry functionality will be implemented in Phase 2.",
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="bg-accent rounded-lg p-2">
          <Send className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-foreground text-lg font-semibold">
            Event Publishing Status
          </h3>
          <p className="text-muted-foreground text-sm">
            ROL Event Bus integration and audit publishing
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <XCircle className="text-destructive h-5 w-5" />
            <p className="text-destructive text-sm">
              Failed to load publishing status
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && audits && audits.length === 0 && (
        <div className="border-border bg-card/50 rounded-lg border border-dashed p-8 text-center">
          <Send className="text-muted-foreground/50 mx-auto h-12 w-12" />
          <p className="text-foreground mt-4 text-sm font-medium">
            No published audits yet
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            Approved audits will appear here after publishing to the event bus
          </p>
        </div>
      )}

      {/* Published Audits List */}
      {!isLoading && !error && audits && audits.length > 0 && (
        <div className="space-y-3">
          {audits.map((audit) => {
            const StatusIcon = getStatusIcon(audit.status);
            const statusColor = getStatusColor(audit.status);

            return (
              <div
                key={audit.auditId}
                className="border-border bg-card hover:bg-card/80 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Audit Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-foreground font-medium">
                        {audit.shelfInfo.shelfName}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusColor,
                        )}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {audit.status}
                      </span>
                    </div>

                    {/* Timestamp */}
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Published{" "}
                        {formatDistanceToNow(new Date(audit.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>
                        {format(new Date(audit.publishedAt), "MMM d, h:mm a")}
                      </span>
                    </div>

                    {/* Event ID (if published) */}
                    {audit.status === "published" && audit.auditId && (
                      <p className="text-muted-foreground text-xs">
                        Event ID:{" "}
                        <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                          {audit.auditId}
                        </code>
                      </p>
                    )}
                  </div>

                  {/* Retry Button (for failed publishes) */}
                  {audit.status === "failed" && (
                    <button
                      onClick={() => handleRetry(audit.auditId)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                        "border-border bg-background hover:bg-muted border",
                        "focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none",
                        "transition-colors",
                      )}
                      aria-label={`Retry publishing for ${audit.shelfInfo.shelfName}`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Summary Footer */}
          <div className="border-border bg-muted/30 rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                <strong className="text-foreground">
                  {audits.filter((a) => a.status === "published").length}
                </strong>{" "}
                published successfully
                {audits.filter((a) => a.status === "failed").length > 0 && (
                  <>
                    {" • "}
                    <strong className="text-destructive">
                      {audits.filter((a) => a.status === "failed").length}
                    </strong>{" "}
                    failed
                  </>
                )}
                {audits.filter((a) => a.status === "pending").length > 0 && (
                  <>
                    {" • "}
                    <strong className="text-muted-foreground">
                      {audits.filter((a) => a.status === "pending").length}
                    </strong>{" "}
                    pending
                  </>
                )}
              </p>
              <p className="text-muted-foreground text-xs">
                Showing {audits.length} recent audit(s)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Integration Info */}
      <div className="border-accent/30 bg-accent/5 rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">ROL Event Bus:</strong> Approved
          audits are automatically published to the event bus for downstream
          systems. Failed publishes can be retried manually or will retry
          automatically after a short delay.
        </p>
      </div>
    </div>
  );
}
