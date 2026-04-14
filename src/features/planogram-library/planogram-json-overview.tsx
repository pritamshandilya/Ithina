import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PlanogramPayload, PlanogramShelfDef } from "@/types/planogram";

type PlanogramJsonOverviewProps = {
  payload: PlanogramPayload | null;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
};

function ShelfDetailBlock({ shelf }: { shelf: PlanogramShelfDef }) {
  const [open, setOpen] = useState(false);
  const productCount = shelf.products.reduce((n, p) => n + p.facings * p.depthCount, 0);

  return (
    <div className="rounded-md border border-border bg-muted/20">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/40"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <span className="truncate">{shelf.name}</span>
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {shelf.products.length} SKUs · {productCount} units
        </span>
      </button>
      {open ? (
        <div className="border-t border-border px-2 py-2 sm:px-3">
          <div className="max-h-64 overflow-auto rounded-md border border-border bg-background">
            <table className="w-full min-w-xl text-left text-xs">
              <thead className="sticky top-0 z-1 border-b border-border bg-muted/80 backdrop-blur">
                <tr className="text-muted-foreground">
                  <th className="px-2 py-1.5 font-medium">SKU</th>
                  <th className="px-2 py-1.5 font-medium">Product</th>
                  <th className="px-2 py-1.5 font-medium">Category</th>
                  <th className="px-2 py-1.5 font-medium">Facing×Depth</th>
                  <th className="px-2 py-1.5 font-medium">W×H×D</th>
                  <th className="px-2 py-1.5 font-medium">Price</th>
                  <th className="px-2 py-1.5 font-medium">Velocity</th>
                  <th className="px-2 py-1.5 font-medium">Role</th>
                  <th className="px-2 py-1.5 font-medium">Promo</th>
                </tr>
              </thead>
              <tbody>
                {shelf.products.map((p) => (
                  <tr key={p.sku} className="border-b border-border/80 last:border-0">
                    <td className="px-2 py-1.5 font-mono text-foreground">{p.sku}</td>
                    <td className="px-2 py-1.5 text-foreground">
                      <span className="line-clamp-2" title={p.name}>
                        {p.name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">{p.brand}</span>
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">{p.category}</td>
                    <td className="px-2 py-1.5 tabular-nums text-foreground">
                      {p.facings}×{p.depthCount}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">
                      {p.width}×{p.height}×{p.depth}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-foreground">
                      {p.price != null ? p.price.toFixed(2) : "—"}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">
                      {p.salesVelocityPerDay != null ? p.salesVelocityPerDay.toFixed(1) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground">
                      {p.planogramRole ?? "—"}
                    </td>
                    <td className="px-2 py-1.5">
                      {p.isOnPromotion ? (
                        <Badge variant="secondary" className="text-[10px]">
                          Promo
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PlanogramJsonOverview({
  payload,
  isLoading,
  emptyMessage = "No planogram to preview.",
  className,
}: PlanogramJsonOverviewProps) {
  const planogram = payload?.planogram;
  const fixture = planogram?.fixture;
  const meta = payload?.metadata ?? planogram?.metadata;

  const tags = useMemo(() => meta?.tags ?? [], [meta?.tags]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!planogram || !fixture) {
    return (
      <Card className={className}>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-medium text-foreground">No planogram data</p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const units = planogram.storeConfig?.units ?? "mm";
  const skuTotal =
    meta?.totalSKUs ?? fixture.shelves.reduce((s, sh) => s + sh.products.length, 0);

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="text-base">Planogram overview</CardTitle>
        <CardDescription>
          Structured summary of the JSON: identity, store context, fixture, and shelf-level SKUs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
          <p className="text-lg font-semibold text-foreground">{planogram.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono text-foreground">{planogram.id}</span>
            <span className="mx-1.5">·</span>v{planogram.version}
            <span className="mx-1.5">·</span>
            {planogram.status}
            <span className="mx-1.5">·</span>
            Created {planogram.createdDate}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{planogram.location}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Shelves
            </p>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {fixture.shelves.length}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              SKUs
            </p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{skuTotal}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Dimensions
            </p>
            <p className="text-sm font-semibold tabular-nums text-foreground">
              {fixture.width}×{fixture.height}×{fixture.depth} {units}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Fixture type
            </p>
            <p className="text-sm font-medium capitalize text-foreground">
              {fixture.type?.replace(/_/g, " ") ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Zone
            </p>
            <p className="text-sm font-medium text-foreground">
              {planogram.physicalLocation?.zone ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Aisle · Bay · Side
            </p>
            <p className="text-sm font-medium text-foreground">
              {planogram.physicalLocation?.aisle ?? "—"} · {planogram.physicalLocation?.bay ?? "—"} ·{" "}
              {planogram.physicalLocation?.side ?? "—"}
            </p>
          </div>
          <div className="col-span-2 rounded-lg border border-border bg-muted/30 px-3 py-2 sm:col-span-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Section
            </p>
            <p className="text-sm font-medium text-foreground">
              {planogram.physicalLocation?.section ?? planogram.location ?? "—"}
            </p>
          </div>
        </div>

        {meta ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/15 px-3 py-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Metadata
            </h3>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">Created by</dt>
                <dd className="text-foreground">{meta.createdBy}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">Updated by</dt>
                <dd className="text-foreground">{meta.updatedBy}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">Source</dt>
                <dd className="text-foreground">{meta.sourceSystem}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">Sync</dt>
                <dd className="text-foreground">{meta.syncStatus}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-medium uppercase text-muted-foreground">Audit trail</dt>
                <dd className="font-mono text-xs text-foreground">{meta.auditTrailId || "—"}</dd>
              </div>
            </dl>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : null}
            {meta.stockingRules ? (
              <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Stocking rules</p>
                <p className="mt-1">
                  Threshold: {meta.stockingRules.restockThreshold} · High-demand:{" "}
                  {meta.stockingRules.highDemandProducts?.join(", ") || "—"}
                </p>
                {meta.stockingRules.notes ? (
                  <p className="mt-1 text-muted-foreground">{meta.stockingRules.notes}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Shelf breakdown
          </h3>
          <div className="space-y-2">
            {fixture.shelves.map((shelf) => (
              <ShelfDetailBlock key={shelf.shelfId} shelf={shelf} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
