import { formatDistanceToNow } from "date-fns";

import { StatusBadge } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { Shelf } from "@/types/maker";

/**
 * Props for the ShelfCard component
 */
export interface ShelfCardProps {
  shelf: Shelf;
  onClick?: (shelfId: string) => void;
  className?: string;
}

/**
 * Format compliance score with color coding
 */
function getComplianceColor(score: number): string {
  if (score >= 90) return "var(--maker-approved)";
  if (score >= 75) return "var(--accent)";
  return "var(--maker-returned)";
}

/**
 * ShelfCard Component
 *
 * Displays information about a single shelf in a card format.
 * Shows aisle/bay numbers, shelf name, audit status, last audit date,
 * and compliance score (if available).
 *
 * Features:
 * - Status badge with color coding
 * - Relative time display (e.g., "2 days ago")
 * - Color-coded compliance score
 * - Optional click handler
 * - Hover effect when clickable
 *
 * @example
 * ```tsx
 * <ShelfCard
 *   shelf={shelfData}
 *   onClick={(id) => navigate(`/shelf/${id}`)}
 * />
 * ```
 */
export function ShelfCard({ shelf, onClick, className }: ShelfCardProps) {
  const isClickable = Boolean(onClick);

  const handleClick = () => {
    if (onClick) {
      onClick(shelf.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick(shelf.id);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border-border space-y-3 rounded-lg border p-4 transition-all",
        isClickable && "hover:border-accent cursor-pointer hover:shadow-md",
        className,
      )}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        isClickable
          ? `View details for ${shelf.shelfName}, Aisle ${
              shelf.aisleCode ??
              (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")
            }, Bay ${
              shelf.bayCode ??
              (shelf.bayNumber != null ? String(shelf.bayNumber) : "—")
            }`
          : undefined
      }
    >
      {/* Header with Aisle/Bay and Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-card-foreground text-base font-semibold">
            Aisle{" "}
            {shelf.aisleCode ??
              (shelf.aisleNumber != null ? `A${shelf.aisleNumber}` : "—")}{" "}
            - Bay{" "}
            {shelf.bayCode ??
              (shelf.bayNumber != null ? String(shelf.bayNumber) : "—")}
          </h3>
          <p className="text-muted-foreground mt-0.5 truncate text-sm">
            {shelf.shelfName}
          </p>
        </div>
        <StatusBadge status={shelf.status} size="sm" />
      </div>

      {/* Description (if available) */}
      {shelf.description && (
        <p className="text-muted-foreground line-clamp-2 text-xs">
          {shelf.description}
        </p>
      )}

      {/* Last Audit Info / Draft Info */}
      {shelf.lastAuditDate && (
        <div className="border-border border-t pt-2">
          <p className="text-muted-foreground text-xs">
            {shelf.status === "draft" ? (
              <>
                <span className="text-accent font-medium">Draft saved</span>{" "}
                {formatDistanceToNow(new Date(shelf.lastAuditDate), {
                  addSuffix: true,
                })}
              </>
            ) : (
              <>
                Last audited{" "}
                <span className="text-card-foreground font-medium">
                  {formatDistanceToNow(new Date(shelf.lastAuditDate), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      )}

      {/* Compliance Score (if available) */}
      {shelf.complianceScore !== undefined && (
        <div className="border-border flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground text-xs">
            Compliance Score
          </span>
          <span
            className="text-lg font-bold tabular-nums"
            style={{ color: getComplianceColor(shelf.complianceScore) }}
          >
            {shelf.complianceScore}%
          </span>
        </div>
      )}

      {/* Never Audited Message */}
      {shelf.status === "never-audited" && (
        <div className="border-border border-t pt-2">
          <p className="text-muted-foreground text-xs italic">
            This shelf has not been audited yet
          </p>
        </div>
      )}

      {/* Draft Resume CTA */}
      {shelf.status === "draft" && (
        <div className="border-border border-t pt-2">
          <p className="text-accent flex items-center gap-1.5 text-xs font-medium">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            Click to resume audit
          </p>
        </div>
      )}
    </div>
  );
}
