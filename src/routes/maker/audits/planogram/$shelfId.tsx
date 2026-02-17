/**
 * Planogram Preview Route
 *
 * Visual preview of a saved planogram shelf.
 * Editable: product name, category, facings/depth; remove products.
 * Access at: /maker/audits/planogram/:shelfId
 */

import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Info } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import MainLayout from "@/components/layouts/main";
import { HeaderContextBar } from "@/components/maker";
import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
  StockingRulesSection,
} from "@/components/planogram";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { updateShelfArrangement } from "@/features/maker/api/planogram";
import {
  planogramShelfPreviewKeys,
  usePlanogramShelfPreview,
  useStores,
} from "@/features/maker/hooks";
import { useToast } from "@/hooks/use-toast";
import { mockUser } from "@/lib/api/mock-data";
import type {
  PlanogramArrangement,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

export const Route = createFileRoute("/maker/audits/planogram/$shelfId")({
  component: PlanogramPreviewPage,
});

function derivePlanogramStats(
  shelves: PlanogramShelfDef[],
  removedItems: PlanogramProduct[]
) {
  const allProducts = shelves.flatMap((s) => s.products);
  const uniqueSkus = new Set(allProducts.map((p) => p.sku)).size;
  const frontFacings = allProducts.reduce((sum, p) => sum + p.facings, 0);
  const totalUnits = allProducts.reduce(
    (sum, p) => sum + p.facings * (p.depthCount || 1),
    0
  );
  const categorySet = new Set(allProducts.map((p) => p.category));

  return {
    shelves: shelves.length,
    skus: uniqueSkus,
    frontFacings,
    totalUnits,
    categories: categorySet.size,
    categoryList: [...categorySet],
    removed: removedItems.length,
  };
}

function deepCopyShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return shelves.map((s) => ({
    ...s,
    products: s.products.map((p) => ({ ...p })),
  }));
}

function PlanogramPreviewPage() {
  const { shelfId } = Route.useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: stores } = useStores();
  const [selectedStoreId, setSelectedStoreId] = useState(() => mockUser.storeId);

  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);

  const [localShelves, setLocalShelves] = useState<PlanogramShelfDef[]>([]);
  const [removedItems, setRemovedItems] = useState<PlanogramProduct[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!preview?.planogramPayload.planogram.fixture.shelves) return;
    const fixtureShelves = preview.planogramPayload.planogram.fixture.shelves;
    const arrangement = preview.shelf.arrangement as PlanogramArrangement | undefined;

    let shelves = deepCopyShelves(fixtureShelves);
    const removed: PlanogramProduct[] = [];

    if (arrangement?.productEdits) {
      shelves = shelves.map((s) => ({
        ...s,
        products: s.products.map((p) => {
          const edits = arrangement.productEdits![p.sku];
          if (!edits) return p;
          return {
            ...p,
            ...(edits.name != null && { name: edits.name }),
            ...(edits.category != null && { category: edits.category }),
            ...(edits.facings != null && { facings: edits.facings }),
            ...(edits.depthCount != null && { depthCount: edits.depthCount }),
          };
        }),
      }));
    }

    if (arrangement?.removedProductIds?.length) {
      const removedSet = new Set(arrangement.removedProductIds);
      for (const shelf of shelves) {
        for (const p of shelf.products) {
          if (removedSet.has(p.sku)) removed.push(p);
        }
      }
      shelves = shelves.map((s) => ({
        ...s,
        products: s.products.filter((p) => !removedSet.has(p.sku)),
      }));
    }

    if (arrangement?.shelfOrder?.length) {
      const orderMap = new Map(
        arrangement.shelfOrder.map((o) => [
          o.shelfId.replace("shelf-", ""),
          o.productIds,
        ])
      );
      shelves = shelves.map((s) => {
        const productIds = orderMap.get(String(s.shelfNumber));
        if (!productIds?.length) return s;
        const bySku = new Map(s.products.map((p) => [p.sku, p]));
        const ordered = productIds
          .map((id) => bySku.get(id))
          .filter((p): p is PlanogramProduct => p != null);
        return { ...s, products: ordered.length ? ordered : s.products };
      });
    }

    setLocalShelves(shelves);
    setRemovedItems(removed);
    setHasChanges(false);
  }, [preview?.planogramPayload.planogram.fixture.shelves, preview?.shelf.arrangement]);

  const findProduct = useCallback(
    (shelfNumber: number, sku: string) => {
      const shelf = localShelves.find((s) => s.shelfNumber === shelfNumber);
      return shelf?.products.find((p) => p.sku === sku);
    },
    [localShelves]
  );

  const onEditName = useCallback(
    (shelfNumber: number, sku: string, newName: string) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.sku === sku ? { ...p, name: newName } : p
                ),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onEditCategory = useCallback(
    (shelfNumber: number, sku: string, newCategory: string) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) =>
                  p.sku === sku ? { ...p, category: newCategory } : p
                ),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onEditFacingsDepth = useCallback(
    (
      shelfNumber: number,
      sku: string,
      updates: { facings?: number; depthCount?: number }
    ) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.map((p) => {
                  if (p.sku !== sku) return p;
                  const facings = updates.facings ?? p.facings;
                  const depthCount = updates.depthCount ?? p.depthCount;
                  return { ...p, facings, depthCount };
                }),
              }
            : s
        )
      );
      setHasChanges(true);
    },
    []
  );

  const onRemoveProduct = useCallback(
    (shelfNumber: number, sku: string) => {
      const product = findProduct(shelfNumber, sku);
      if (!product) return;
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? {
                ...s,
                products: s.products.filter((p) => p.sku !== sku),
              }
            : s
        )
      );
      setRemovedItems((prev) => [...prev, product]);
      setHasChanges(true);
    },
    [findProduct]
  );

  const onRestoreProduct = useCallback(
    (shelfNumber: number, product: PlanogramProduct) => {
      setLocalShelves((prev) =>
        prev.map((s) =>
          s.shelfNumber === shelfNumber
            ? { ...s, products: [...s.products, { ...product }] }
            : s
        )
      );
      setRemovedItems((prev) => prev.filter((p) => p.sku !== product.sku));
      setHasChanges(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!preview || !hasChanges || !shelfId) return;
    setIsSaving(true);
    try {
      const originalShelves =
        preview.planogramPayload.planogram.fixture.shelves;
      const productEdits: NonNullable<PlanogramArrangement["productEdits"]> = {};
      for (const shelf of localShelves) {
        for (const p of shelf.products) {
          const orig = originalShelves
            .flatMap((s) => s.products)
            .find((op) => op.sku === p.sku);
          if (!orig) continue;
          const edits: { name?: string; category?: string; facings?: number; depthCount?: number } = {};
          if (p.name !== orig.name) edits.name = p.name;
          if (p.category !== orig.category) edits.category = p.category;
          if (p.facings !== orig.facings) edits.facings = p.facings;
          if (p.depthCount !== orig.depthCount) edits.depthCount = p.depthCount;
          if (Object.keys(edits).length > 0) productEdits[p.sku] = edits;
        }
      }
      const arrangement: PlanogramArrangement = {
        planogramId: preview.planogramPayload.planogram.id,
        shelfOrder: localShelves.map((s) => ({
          shelfId: `shelf-${s.shelfNumber}`,
          productIds: s.products.map((p) => p.sku),
        })),
        removedProductIds: removedItems.map((p) => p.sku),
        productEdits: Object.keys(productEdits).length > 0 ? productEdits : undefined,
      };
      const updated = await updateShelfArrangement(shelfId, arrangement);
      if (updated) {
        await queryClient.invalidateQueries({
          queryKey: planogramShelfPreviewKeys.byShelfId(shelfId),
        });
        toast({ title: "Changes saved", description: "Your planogram edits have been saved." });
        setHasChanges(false);
      } else {
        toast({
          title: "Save failed",
          description: "Could not update shelf. It may not exist.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Save failed",
        description: "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    preview,
    hasChanges,
    shelfId,
    localShelves,
    removedItems,
    queryClient,
    toast,
  ]);

  const planogram = preview?.planogramPayload.planogram;
  const metadata = preview?.planogramPayload.metadata;
  const fixture = planogram?.fixture;
  const highDemandSkus =
    preview?.planogramPayload.stockingRules?.highDemandProducts ?? [];

  const shelvesToShow = useMemo(
    () =>
      localShelves.length > 0 ? localShelves : (fixture?.shelves ?? []),
    [localShelves, fixture?.shelves]
  );

  const stats = useMemo(
    () => derivePlanogramStats(shelvesToShow, removedItems),
    [shelvesToShow, removedItems]
  );

  const shelfCapacities = useMemo(() => {
    const orig = fixture?.shelves ?? [];
    return Object.fromEntries(
      orig.map((s) => [
        s.shelfNumber,
        s.products.reduce((sum, p) => sum + p.facings, 0),
      ])
    );
  }, [fixture?.shelves]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <HeaderContextBar
            stores={stores ?? []}
            selectedStoreId={selectedStoreId}
            onStoreChange={setSelectedStoreId}
          />

          <header className="flex flex-wrap items-center gap-4">
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
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-chart-2 text-white hover:opacity-90"
              >
                <Check className="size-4" aria-hidden />
                {isSaving ? "Saving…" : "Save"}
              </Button>
            )}
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

          {preview && !isLoading && (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Main content – stacks on small screens */}
              <div className="min-w-0 flex-1 space-y-6">
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

              {/* Category filter tags */}
              <div>
                <p className="mb-2 text-xs font-medium text-foreground">
                  Categories
                </p>
                <CategoryFilterTags categories={stats.categoryList} />
              </div>

              {/* Shelf layout – sorted by verticalPosition descending (top first) */}
              <div className="space-y-6">
                {[...shelvesToShow]
                  .sort((a, b) => b.verticalPosition - a.verticalPosition)
                  .map((shelf) => (
                    <ShelfRow
                      key={shelf.shelfNumber}
                      shelf={shelf}
                      highDemandSkus={highDemandSkus}
                      editHandlers={{
                        onEditName,
                        onEditCategory,
                        onEditFacingsDepth,
                        onRemoveProduct,
                      }}
                    />
                  ))}
              </div>

              {/* Product Details + Stocking Rules – side-by-side on large screens */}
              <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <ProductDetailsTable
                  shelves={shelvesToShow}
                  highDemandSkus={highDemandSkus}
                />
                <div className="rounded-lg border border-border bg-card/80 p-4">
                  <StockingRulesSection
                    stockingRules={preview.planogramPayload.stockingRules}
                  />
                </div>
              </div>
              </div>

              {/* Removed Items sidebar – right side on large screens */}
              <RemovedItemsSidebar
                removedItems={removedItems}
                shelves={shelvesToShow}
                shelfCapacities={shelfCapacities}
                onRestore={onRestoreProduct}
              />
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
