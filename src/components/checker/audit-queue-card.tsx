/**
 * Audit Queue Card Component
 * 
 * Displays a single audit in the review queue.
 * Shows all key information needed for triage and prioritization.
 * 
 * Features:
 * - Shelf identification
 * - Submitter info with avatar
 * - Audit mode badge
 * - Large, color-coded compliance score
 * - Violation count
 * - Rule version used
 * - Relative timestamp
 * - Review button
 */

import { formatDistanceToNow } from "date-fns";
import { Camera, ClipboardList, AlertCircle } from "lucide-react";

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
  onClick?: (auditId: string) => void;
  
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
  if (score < 50) return "color-mix(in oklch, var(--destructive) 15%, transparent)";
  if (score < 80) return "color-mix(in oklch, var(--action-warning) 15%, transparent)";
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
export function AuditQueueCard({ audit, onClick, className }: AuditQueueCardProps) {
  const isClickable = Boolean(onClick);
  const complianceScore = audit.complianceScore || 0;
  const isCritical = complianceScore < 50;
  const hasViolations = audit.violationCount > 0;
  const complianceColor = getComplianceColor(complianceScore);
  const complianceBg = getComplianceBgColor(complianceScore);
  
  const handleClick = () => {
    if (onClick) {
      onClick(audit.id);
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
        "rounded-lg bg-card/50 backdrop-blur-sm border-2 p-5 space-y-4 transition-all",
        isClickable && "cursor-pointer hover:border-accent hover:shadow-lg group",
        isCritical && "border-destructive/50",
        !isCritical && "border-border/50",
        className
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
          <h3 className="text-base font-bold text-card-foreground">
            Aisle {audit.shelfInfo.aisleNumber}, Bay {audit.shelfInfo.bayNumber}
          </h3>
          <p className="text-sm text-muted-foreground truncate">
            {audit.shelfInfo.shelfName}
          </p>
        </div>
        
        {/* Compliance Score Badge - Only for Vision Edge */}
        {audit.mode === "vision-edge" && complianceScore !== undefined ? (
          <div 
            className="flex flex-col items-center justify-center rounded-lg px-4 py-2 shrink-0"
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
            <span className="text-xs text-muted-foreground">
              Compliance
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg px-4 py-2 shrink-0 bg-muted/20 border-2 border-muted/40">
            <span className="text-sm font-semibold text-muted-foreground text-center">
              Awaiting<br />Review
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
          <p className="text-sm text-card-foreground truncate">
            {audit.submittedByName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(audit.submittedAt), { addSuffix: true })}
          </p>
        </div>
        
        {/* Audit Mode Badge */}
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
            audit.mode === "vision-edge"
              ? "bg-accent/20 text-accent border border-accent/40"
              : "bg-muted/20 text-muted-foreground border border-muted/40"
          )}
        >
          {audit.mode === "vision-edge" ? (
            <>
              <Camera className="size-3" aria-hidden="true" />
              Vision Edge
            </>
          ) : (
            <>
              <ClipboardList className="size-3" aria-hidden="true" />
              Assist Mode
            </>
          )}
        </span>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            Rule: <span className="font-medium text-card-foreground">{audit.ruleVersionUsed}</span>
          </span>
          {hasViolations && (
            <span className="flex items-center gap-1">
              <AlertCircle 
                className="size-3" 
                style={{ color: complianceColor }}
                aria-hidden="true"
              />
              <span style={{ color: complianceColor }}>
                {audit.violationCount} {audit.violationCount === 1 ? "violation" : "violations"}
              </span>
            </span>
          )}
          {!hasViolations && (
            <span className="text-chart-2">
              No violations
            </span>
          )}
        </div>
      </div>

      {/* Review Button */}
      {onClick && (
        <div className="pt-2 border-t border-border">
          <Button
            className="w-full bg-accent text-white hover:bg-accent/90"
            onClick={(e) => {
              e.stopPropagation();
              onClick(audit.id);
            }}
            aria-label={`Review audit for ${audit.shelfInfo.shelfName}`}
          >
            Review Audit
          </Button>
        </div>
      )}
    </div>
  );
}
