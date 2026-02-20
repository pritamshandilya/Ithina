import { formatDistanceToNow } from "date-fns";
import { AlertCircle, ClipboardList, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingAudits } from "@/features/checker/hooks";
import { useStore } from "@/providers/store";
import { mockCheckerUser } from "@/lib/api/mock-data";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";

const MAX_ITEMS = 8;
const SECTION_HEIGHT = 420;

export interface CheckerAttentionSectionProps {
  onAuditClick?: (auditId: string) => void;
  onViewAll?: () => void;
  className?: string;
}

function getComplianceColor(score: number): string {
  if (score < 50) return "var(--destructive)";
  if (score < 80) return "var(--action-warning)";
  return "var(--chart-2)";
}

/**
 * "What Needs Your Attention" - critical and pending audits for checker.
 * Prioritizes critical (compliance <50%) then pending.
 */
export function CheckerAttentionSection({
  onAuditClick,
  onViewAll,
  className,
}: CheckerAttentionSectionProps) {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? mockCheckerUser.storeId;
  const { data: audits = [], isLoading } = usePendingAudits(storeId);

  const criticalAudits = audits.filter((a) => (a.complianceScore ?? 0) < 50);
  const attentionAudits = [
    ...criticalAudits.slice(0, MAX_ITEMS),
    ...audits
      .filter((a) => (a.complianceScore ?? 0) >= 50)
      .slice(0, Math.max(0, MAX_ITEMS - criticalAudits.length)),
  ];

  const hasItems = attentionAudits.length > 0;

  const handleClick = (audit: CheckerAudit) => {
    onAuditClick?.(audit.id);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-48" />
        <div
          className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
          style={{ height: SECTION_HEIGHT }}
        >
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "color-mix(in oklch, var(--action-warning) 20%, transparent)" }}
          aria-hidden
        >
          <AlertCircle
            className="size-4"
            style={{ color: "var(--action-warning)" }}
            aria-hidden
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            What Needs Your Attention
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasItems
              ? "Critical and pending audits awaiting review"
              : "No audits in queue"}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border border-border bg-card overflow-hidden flex flex-col shrink-0"
        style={{ height: SECTION_HEIGHT }}
      >
        {!hasItems ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 px-6 text-center min-h-0">
            <div
              className="flex size-12 items-center justify-center rounded-full mb-3"
              style={{ backgroundColor: "color-mix(in oklch, var(--chart-2) 15%, transparent)" }}
              aria-hidden
            >
              <ClipboardList
                className="size-6"
                style={{ color: "var(--chart-2)" }}
                aria-hidden
              />
            </div>
            <p className="font-medium text-foreground">Review queue clear</p>
            <p className="text-sm text-muted-foreground mt-1">
              No audits pending. New submissions will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-auto">
              <ul className="divide-y divide-border" role="list">
                {attentionAudits.map((audit) => {
                  const score = audit.complianceScore ?? 0;
                  const isCritical = score < 50;

                  return (
                    <li
                      key={audit.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg",
                            isCritical ? "bg-destructive/10" : "bg-accent/10"
                          )}
                          aria-hidden
                        >
                          <AlertCircle
                            className="size-4"
                            style={{
                              color: isCritical
                                ? "var(--destructive)"
                                : "var(--accent)",
                            }}
                            aria-hidden
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">
                            {audit.shelfInfo.shelfName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {audit.submittedByName} ·{" "}
                            {audit.submittedAt
                              ? formatDistanceToNow(new Date(audit.submittedAt), {
                                  addSuffix: true,
                                })
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="tabular-nums font-semibold text-sm"
                          style={{ color: getComplianceColor(score) }}
                        >
                          {score}%
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleClick(audit)}
                          style={{
                            backgroundColor: "var(--accent)",
                            color: "var(--accent-foreground)",
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {audits.length > 0 && onViewAll && (
              <div className="border-t border-border px-4 py-3 bg-muted/20 shrink-0">
                <button
                  type="button"
                  onClick={onViewAll}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-accent hover:text-accent/90 transition-colors py-1"
                >
                  View all audits
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
