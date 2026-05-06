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
        Compact JSON summary. Detailed product and shelf view is available in
        the 2D preview.
      </CardDescription>
    </CardHeader>
  );

  const detailsBlock = !payload ? null : (
    <CardContent className={embedded ? "space-y-3 px-0 pb-0" : "space-y-3"}>
      <div className="border-border bg-muted/20 rounded-lg border px-3 py-3">
        <p className="text-foreground text-lg font-semibold">{payload.name}</p>
        <p className="text-muted-foreground mt-0.5 text-xs">
          v{payload.version ?? "—"}
          <span className="mx-1.5">·</span>
          {payload.status}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {payload.description ?? "—"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Dimension
          </p>
          <p className="text-foreground text-sm font-semibold tabular-nums">
            {payload.fixture.width}×{payload.fixture.height}×
            {payload.fixture.depth}
          </p>
        </div>
        {/* <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Shelves
          </p>
          <p className="text-foreground text-sm font-semibold tabular-nums">
            {payload.shelves.length}
          </p>
        </div>
        <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            SKUs
          </p>
          <p className="text-foreground text-sm font-semibold tabular-nums">
            {payload.shelves.reduce(
              (sum, shelf) => sum + shelf.products.length,
              0,
            )}
          </p>
        </div>
        <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            Total Units
          </p>
          <p className="text-foreground text-sm font-semibold tabular-nums">
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
        </div> */}
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
        <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 text-center">
          <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
            <LayoutGrid className="text-muted-foreground h-7 w-7" aria-hidden />
          </div>
          <p className="text-foreground font-medium">No planogram data</p>
          <p className="text-muted-foreground mt-1 text-sm">{emptyMessage}</p>
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
