import { LayoutGrid } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getShelfDisplayLabel,
  sortPlanogramShelves,
} from "@/lib/planogram/planogramSchema";
import type { PlanogramPayload } from "@/types/planogram";

interface PlanogramPreviewCardProps {
  selectedPlanogramId: string;
  isLoading: boolean;
  data?: PlanogramPayload;
}

export function PlanogramPreviewCard({
  selectedPlanogramId,
  isLoading,
  data,
}: PlanogramPreviewCardProps) {
  const fixture = data?.fixture;
  const shelves = data ? sortPlanogramShelves(data.shelves) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Planogram preview</CardTitle>
        <CardDescription>Summary of the selected planogram.</CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedPlanogramId ? (
          <div className="border-border bg-muted/30 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
            <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
              <LayoutGrid
                className="text-muted-foreground h-7 w-7"
                aria-hidden
              />
            </div>
            <p className="text-foreground font-medium">No planogram loaded</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Select a planogram to preview and associate.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : data && fixture ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile label="Shelves" value={shelves.length} />
              <StatTile
                label="SKUs"
                value={shelves.reduce(
                  (s, shelf) => s + shelf.products.length,
                  0,
                )}
              />
              <StatTile
                label="Dimensions"
                value={`${fixture.width}×${fixture.height}×${fixture.depth}`}
                compact
              />
              <StatTile label="Status" value={data.status} compact />
              <StatTile label="Version" value={data.version ?? "—"} compact />
              <div className="border-border bg-muted/30 col-span-2 rounded-lg border px-3 py-2 sm:col-span-3">
                <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
                  Description
                </p>
                <p className="text-foreground text-sm font-medium">
                  {data.description ?? "—"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                Shelf breakdown
              </h3>
              <ul className="space-y-2">
                {shelves.map((shelf) => {
                  const productCount = shelf.products.reduce(
                    (n, p) => n + p.facings * p.depth_count,
                    0,
                  );
                  return (
                    <li
                      key={shelf.id}
                      className="border-border bg-muted/20 flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="text-foreground font-medium">
                        {getShelfDisplayLabel(shelves, shelf.id)} · {shelf.id}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {shelf.products.length} items · {productCount} units
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Planogram not found.</p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  compact?: boolean;
}

function StatTile({ label, value, compact = false }: StatTileProps) {
  return (
    <div className="border-border bg-muted/30 rounded-lg border px-3 py-2">
      <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
        {label}
      </p>
      <p
        className={
          compact
            ? "text-foreground text-sm font-medium"
            : "text-foreground text-lg font-semibold tabular-nums"
        }
      >
        {value}
      </p>
    </div>
  );
}
