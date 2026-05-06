/**
 * Audit Queue Card Component
 *
 * Displays a single audit in the review queue.
 * Shows all key information needed for triage and prioritization.
 *
 * Features:
 * - Shelf identification
 * - Submitter info with avatar
 * - Audit mode badge (Planogram Based / Adhoc Analysis)
 * - Large, color-coded compliance score
 * - Violation count
 * - Rule version used
 * - Relative timestamp
 * - Review button
 */
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Camera,
  Check,
  ClipboardList,
  Trash2,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CheckerAudit } from "@/types/checker";

export interface AuditQueueCardProps {
  /**
   * The audit to display
   */
  audit: CheckerAudit;

  /**
   * Click handler for reviewing the audit
   */
  onClick?: (
    auditId: string,
    event?: React.MouseEvent | React.KeyboardEvent,
  ) => void;

  /**
   * Action handlers
   */
  onApprove?: (auditId: string) => void;
  onReject?: (auditId: string) => void;
  onDelete?: (auditId: string) => void;

  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Get color for compliance score
 */
function getComplianceColor(score: number): string {
  if (score < 50) return "var(--destructive)";
  if (score < 80) return "var(--action-warning)";
  return "var(--chart-2)";
}

/**
 * Get background color for compliance score badge
 */
function getComplianceBgColor(score: number): string {
  if (score < 50)
    return "color-mix(in oklch, var(--destructive) 15%, transparent)";
  if (score < 80)
    return "color-mix(in oklch, var(--action-warning) 15%, transparent)";
  return "color-mix(in oklch, var(--chart-2) 15%, transparent)";
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * AuditQueueCard Component
 *
 * Card displaying audit information in the review queue.
 * Entire card is clickable to open review workspace.
 */
export function AuditQueueCard({
  audit,
  onClick,
  onApprove,
  onReject,
  onDelete,
  className,
}: AuditQueueCardProps) {
  const isClickable = Boolean(onClick);
  const complianceScore = audit.complianceScore || 0;
  const isCritical = complianceScore < 50;
  const hasViolations = audit.violationCount > 0;
  const complianceColor = getComplianceColor(complianceScore);
  const complianceBg = getComplianceBgColor(complianceScore);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(audit.id, e);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(audit.id);
    }
  };

  return (
    <div
      className={cn(
        "bg-card/50 space-y-4 rounded-lg border-2 p-5 backdrop-blur-sm transition-all",
        isClickable &&
          "hover:border-accent group cursor-pointer hover:shadow-lg",
        isCritical && "border-destructive/50",
        !isCritical && "border-border/50",
        className,
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        isClickable
          ? `Review audit for ${audit.shelfInfo.shelfName}, compliance ${complianceScore}%`
          : undefined
      }
    >
      {/* Header: Shelf Info and Compliance Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="text-card-foreground text-base font-bold">
            Aisle {audit.shelfInfo.aisleCode}, Bay {audit.shelfInfo.bayCode}
          </h3>
          <p className="text-muted-foreground truncate text-sm">
            {audit.shelfInfo.shelfName}
          </p>
        </div>

        {/* Compliance Score Badge - Shown when AI analysis has run */}
        {audit.complianceScore !== undefined ? (
          <div
            className="flex shrink-0 flex-col items-center justify-center rounded-lg px-4 py-2"
            style={{
              backgroundColor: complianceBg,
              borderWidth: "2px",
              borderStyle: "solid",
              borderColor: complianceColor,
            }}
          >
            <span
              className="text-2xl font-bold tabular-nums"
              style={{ color: complianceColor }}
            >
              {complianceScore}%
            </span>
            <span className="text-muted-foreground text-xs">Compliance</span>
          </div>
        ) : (
          <div className="bg-muted/20 border-muted/40 flex shrink-0 flex-col items-center justify-center rounded-lg border-2 px-4 py-2">
            <span className="text-muted-foreground text-center text-sm font-semibold">
              Awaiting
              <br />
              Review
            </span>
          </div>
        )}
      </div>

      {/* Submitter and Mode */}
      <div className="flex items-center gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
            {getInitials(audit.submittedByName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-card-foreground truncate text-sm">
            {audit.submittedByName}
          </p>
          <p className="text-muted-foreground text-xs">
            {audit.submittedAt
              ? formatDistanceToNow(new Date(audit.submittedAt), {
                  addSuffix: true,
                })
              : "Not submitted"}
          </p>
        </div>

        {/* Audit Mode Badge */}
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
            audit.mode === "planogram-based" || audit.mode === "vision-edge"
              ? "bg-accent/20 text-accent border-accent/40 border"
              : "bg-muted/20 text-muted-foreground border-muted/40 border",
          )}
        >
          {audit.mode === "planogram-based" || audit.mode === "vision-edge" ? (
            <>
              <Camera className="size-3" aria-hidden="true" />
              Planogram Based
            </>
          ) : (
            <>
              <ClipboardList className="size-3" aria-hidden="true" />
              Adhoc Analysis
            </>
          )}
        </span>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="text-muted-foreground flex items-center gap-4">
          <span>
            Rule:{" "}
            <span className="text-card-foreground font-medium">
              {audit.ruleVersionUsed}
            </span>
          </span>
          {hasViolations && (
            <span className="flex items-center gap-1">
              <AlertCircle
                className="size-3"
                style={{ color: complianceColor }}
                aria-hidden="true"
              />
              <span style={{ color: complianceColor }}>
                {audit.violationCount}{" "}
                {audit.violationCount === 1 ? "violation" : "violations"}
              </span>
            </span>
          )}
          {!hasViolations && (
            <span className="text-chart-2">No violations</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-border flex items-center gap-2 border-t pt-2">
        <div className="grid w-full grid-cols-3 gap-2">
          {onApprove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(audit.id);
              }}
              className="flex h-9 items-center justify-center gap-1.5 border-green-500/20 bg-green-500/5 px-2 text-xs font-semibold text-green-600 transition-all hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-700"
            >
              <Check className="size-3.5" />
              <span>Approve</span>
            </Button>
          )}
          {onReject && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject(audit.id);
              }}
              className="flex h-9 items-center justify-center gap-1.5 border-orange-500/20 bg-orange-500/5 px-2 text-xs font-semibold text-orange-600 transition-all hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-700"
            >
              <X className="size-3.5" />
              <span>Reject</span>
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(audit.id);
              }}
              className="bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 flex h-9 items-center justify-center gap-1.5 px-2 text-xs font-semibold transition-all"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
