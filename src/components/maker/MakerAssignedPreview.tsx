import { Link } from "@tanstack/react-router";
import { ChevronRight, Rows3 } from "lucide-react";

import { ShelfCard } from "./ShelfCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useShelves } from "@/queries/maker";

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
            style={{
              backgroundColor:
                "color-mix(in oklch, var(--accent) 15%, transparent)",
            }}
            aria-hidden
          >
            <Rows3
              className="size-4"
              style={{ color: "var(--accent)" }}
              aria-hidden
            />
          </div>
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Assigned Shelves
            </h2>
            <p className="text-muted-foreground text-sm">
              {shelves.length} shelf{shelves.length !== 1 ? "s" : ""} assigned
              to you
            </p>
          </div>
        </div>

        {hasMore && (
          <Link
            to="/maker/audits/planogram"
            className="text-accent hover:text-accent/90 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View all
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {shelves.length === 0 ? (
        <div className="border-border bg-card rounded-xl border p-12 text-center">
          <p className="text-foreground font-medium">No Shelves Assigned</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Contact your manager to get shelf assignments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {previewShelves.map((shelf) => (
            <ShelfCard key={shelf.id} shelf={shelf} onClick={onShelfClick} />
          ))}
        </div>
      )}

      {shelves.length > 0 && !hasMore && (
        <div className="flex justify-end">
          <Link
            to="/maker/audits/planogram"
            className="text-accent hover:text-accent/90 inline-flex items-center gap-1 text-sm font-medium transition-colors"
          >
            View planogram audits
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </div>
  );
}
