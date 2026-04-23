import { LayoutGrid } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PlanogramPayload } from "@/types/planogram";

type PlanogramJsonOverviewProps = {
  payload: PlanogramPayload | null;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  embedded?: boolean;
};

export function PlanogramJsonOverview({
  payload,
  isLoading,
  emptyMessage = "No planogram to preview.",
  className,
  embedded = false,
}: PlanogramJsonOverviewProps) {
  const titleBlock = (
    <CardHeader className={embedded ? "px-0 pt-0" : undefined}>
      <CardTitle className="text-base">Planogram overview</CardTitle>
      <CardDescription>
        Compact JSON summary. Detailed product and shelf view is available in the 2D preview.
      </CardDescription>
    </CardHeader>
  );

  const detailsBlock =
    !payload ? null : (
      <CardContent className={embedded ? "space-y-3 px-0 pb-0" : "space-y-3"}>
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
          <p className="text-lg font-semibold text-foreground">{payload.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            v{payload.version ?? "—"}
            <span className="mx-1.5">·</span>
            {payload.status}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{payload.description ?? "—"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Fixture
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {payload.fixture.width}×{payload.fixture.height}×{payload.fixture.depth}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Shelves
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {payload.shelves.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              SKUs
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {payload.shelves.reduce((sum, shelf) => sum + shelf.products.length, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Total Units
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {payload.shelves.reduce(
                (sum, shelf) =>
                  sum +
                  shelf.products.reduce(
                    (productSum, product) =>
                      productSum + product.facings * product.depth_count,
                    0,
                  ),
                0,
              )}
            </p>
          </div>
        </div>
      </CardContent>
    );

  if (isLoading) {
    if (embedded) {
      return (
        <div className={cn("space-y-3", className)}>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    return (
      <Card className={className}>
        {titleBlock}
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!payload) {
    const empty = (
      <CardContent className={embedded ? "px-0 py-10" : "py-10"}>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
          </div>
          <p className="font-medium text-foreground">No planogram data</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      </CardContent>
    );
    if (embedded) {
      return (
        <div className={cn(className)}>
          {titleBlock}
          {empty}
        </div>
      );
    }
    return (
      <Card className={className}>
        {titleBlock}
        {empty}
      </Card>
    );
  }

  if (embedded) {
    return (
      <div className={cn(className)}>
        {titleBlock}
        {detailsBlock}
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      {titleBlock}
      {detailsBlock}
    </Card>
  );
}
