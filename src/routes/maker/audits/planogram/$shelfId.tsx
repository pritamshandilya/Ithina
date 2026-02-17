/**
 * Planogram Preview Route
 *
 * Visual preview of a saved planogram shelf.
 * Access at: /maker/audits/planogram/:shelfId
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanogramShelfPreview, useStores } from "@/features/maker/hooks";
import { mockUser } from "@/lib/api/mock-data";
import type { PlanogramPayload } from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/planogram/$shelfId")({
  component: PlanogramPreviewPage,
});

function derivePlanogramStats(payload: PlanogramPayload) {
  const { planogram } = payload;
  const fixture = planogram.fixture;
  const allProducts = fixture.shelves.flatMap((s) => s.products);

  const uniqueSkus = new Set(allProducts.map((p) => p.sku)).size;
  const frontFacings = allProducts.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = allProducts.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0
  );
  const categories = new Set(allProducts.map((p) => p.category)).size;

  return {
    shelves: fixture.shelfCount,
    skus: uniqueSkus,
    frontFacings,
    totalUnits,
    categories,
    removed: 0,
  };
}

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);

  const stats = useMemo(() => {
    if (!preview) return null;
    return derivePlanogramStats(preview.planogramPayload);
  }, [preview]);

  const planogram = preview?.planogramPayload.planogram;
  const metadata = preview?.planogramPayload.metadata;
  const fixture = planogram?.fixture;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/maker/audits/planogram">
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : error ? (
                <h1 className="text-2xl font-bold text-destructive">Error loading planogram</h1>
              ) : preview ? (
                <>
                  <h1 className="text-2xl font-bold text-foreground truncate">
                    {preview.shelf.shelfName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    v{planogram?.version ?? "1.0"} {metadata?.location ?? "—"} ·{" "}
                    {metadata?.status ?? "active"}
                  </p>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-foreground">Planogram not found</h1>
              )}
            </div>
          </header>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive font-medium">Failed to load planogram</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This shelf may not have planogram data, or it could not be loaded.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/maker/audits/planogram">Back to list</Link>
              </Button>
            </div>
          )}

          {preview && stats && !isLoading && (
            <div className="space-y-6">
              {/* Summary stats */}
              <div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
                role="region"
                aria-label="Planogram summary metrics"
              >
                <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
                <StatCard title="SKUs" value={stats.skus} className="stat-card" />
                <StatCard
                  title="Front Facings"
                  value={stats.frontFacings}
                  className="stat-card"
                />
                <StatCard
                  title="Total Units (w/ depth)"
                  value={stats.totalUnits}
                  className="stat-card"
                />
                <StatCard title="Categories" value={stats.categories} className="stat-card" />
                <StatCard title="Removed" value={stats.removed} className="stat-card" />
              </div>

              {/* Fixture banner */}
              {fixture && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <Info className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="text-sm text-foreground">
                    Fixture: {fixture.width}×{fixture.height}×{fixture.depth}
                    {fixture.units} · {fixture.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Click name to edit · X to remove
                  </span>
                </div>
              )}

              {/* Placeholder for shelf layout (Milestone 3) */}
              <div className="rounded-xl border border-border bg-card/80 p-6">
                <p className="text-sm text-muted-foreground">
                  Shelf layout with product blocks coming in next milestone.
                </p>
              </div>
            </div>
          )}

          {!preview && !isLoading && !error && (
            <div className="rounded-xl border border-border bg-card/80 p-6 text-center">
              <p className="text-muted-foreground">Planogram not found.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/maker/audits/planogram">Back to list</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
