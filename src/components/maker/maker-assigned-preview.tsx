import { Link } from "@tanstack/react-router";
import { Rows3, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useShelves } from "@/queries/maker";
import { cn } from "@/lib/utils";

import { ShelfCard } from "./shelf-card";

const PREVIEW_COUNT = 6;

export interface MakerAssignedPreviewProps {
  onShelfClick?: (shelfId: string) => void;
  className?: string;
}

/**
 * Compact preview of assigned shelves with link to full list.
 * Shows up to 6 shelves in a grid for quick access.
 */
export function MakerAssignedPreview({
  onShelfClick,
  className,
}: MakerAssignedPreviewProps) {
  const { data: shelves, isLoading, error } = useShelves();

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !shelves) {
    return null;
  }

  const previewShelves = shelves.slice(0, PREVIEW_COUNT);
  const hasMore = shelves.length > PREVIEW_COUNT;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "color-mix(in oklch, var(--accent) 15%, transparent)" }}
            aria-hidden
          >
            <Rows3
              className="size-4"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Assigned Shelves
            </h2>
            <p className="text-sm text-muted-foreground">
              {shelves.length} shelf{shelves.length !== 1 ? "s" : ""} assigned to you
            </p>
          </div>
        </div>

        {hasMore && (
          <Link
            to="/maker/audits/planogram"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/90 transition-colors"
          >
            View all
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {shelves.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="font-medium text-foreground">No Shelves Assigned</p>
          <p className="text-sm text-muted-foreground mt-1">
            Contact your manager to get shelf assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewShelves.map((shelf) => (
            <ShelfCard
              key={shelf.id}
              shelf={shelf}
              onClick={onShelfClick}
            />
          ))}
        </div>
      )}

      {shelves.length > 0 && !hasMore && (
        <div className="flex justify-end">
          <Link
            to="/maker/audits/planogram"
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent/90 transition-colors"
          >
            View planogram audits
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
