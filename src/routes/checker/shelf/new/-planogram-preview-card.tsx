import { LayoutGrid } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PlanogramPreviewData = {
  planogram?: {
    storeConfig?: { units?: string };
    physicalLocation?: {
      zone?: string;
      aisle?: string;
      bay?: string;
      section?: string;
    };
    location?: string;
    fixture?: {
      type?: string;
      width: number;
      height: number;
      depth: number;
      shelves: Array<{
        shelfNumber: string | number;
        name: string;
        products: Array<{ facings: number; depthCount: number }>;
      }>;
    };
  };
  metadata?: { totalSKUs?: number };
};

interface PlanogramPreviewCardProps {
  selectedPlanogramId: string;
  isLoading: boolean;
  data?: PlanogramPreviewData;
}

export function PlanogramPreviewCard({
  selectedPlanogramId,
  isLoading,
  data,
}: PlanogramPreviewCardProps) {
  const planogram = data?.planogram;
  const metadata = data?.metadata;
  const fixture = planogram?.fixture;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Planogram preview</CardTitle>
        <CardDescription>
          Summary of the selected planogram. Edit arrangement in a future release.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedPlanogramId ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-medium text-foreground">No planogram loaded</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a planogram to preview and associate.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : planogram && fixture ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <StatTile label="Shelves" value={fixture.shelves.length} />
              <StatTile
                label="SKUs"
                value={
                  metadata?.totalSKUs ??
                  fixture.shelves.reduce((s, sh) => s + sh.products.length, 0)
                }
              />
              <StatTile
                label="Dimensions"
                value={`${fixture.width}×${fixture.height}×${fixture.depth} ${planogram.storeConfig?.units ?? "mm"}`}
                compact
              />
              <StatTile
                label="Fixture type"
                value={fixture.type?.replace(/_/g, " ") ?? "—"}
                compact
                capitalize
              />
              <StatTile
                label="Zone"
                value={planogram.physicalLocation?.zone ?? "—"}
                compact
              />
              <StatTile
                label="Aisle · Bay"
                value={`${planogram.physicalLocation?.aisle ?? "—"} · ${planogram.physicalLocation?.bay ?? "—"}`}
                compact
              />
              <div className="col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Section
                </p>
                <p className="text-sm font-medium text-foreground">
                  {planogram.physicalLocation?.section ?? planogram.location ?? "—"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shelf breakdown
              </h3>
              <ul className="space-y-2">
                {fixture.shelves.map((shelf) => {
                  const productCount = shelf.products.reduce(
                    (n, p) => n + p.facings * p.depthCount,
                    0,
                  );
                  return (
                    <li
                      key={String(shelf.shelfNumber)}
                      className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-foreground">{shelf.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {shelf.products.length} items · {productCount} units
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Planogram not found.</p>
        )}
      </CardContent>
    </Card>
  );
}

interface StatTileProps {
  label: string;
  value: string | number;
  compact?: boolean;
  capitalize?: boolean;
}

function StatTile({ label, value, compact = false, capitalize = false }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          compact
            ? `text-sm font-medium text-foreground ${capitalize ? "capitalize" : ""}`
            : "text-lg font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </p>
    </div>
  );
}
