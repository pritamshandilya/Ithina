import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";

import MainLayout from "@/components/layouts/main";
import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
} from "@/components/planogram";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlanogramShelfPreview } from "@/queries/maker";
import { useStoreFixtureDetailPlanogramEditor } from "@/components/checker/stores/use-store-fixture-detail-planogram-editor";
import { sortPlanogramShelves } from "@/lib/planogram/planogram-schema";

interface PlanogramShelfEditorViewProps {
  shelfId: string;
  backTo: string;
  title: string;
}

export function PlanogramShelfEditorView({
  shelfId,
  backTo,
  title,
}: PlanogramShelfEditorViewProps) {
  const { data: preview, isLoading, error } = usePlanogramShelfPreview(shelfId);
  const editor = useStoreFixtureDetailPlanogramEditor({
    shelfId,
    preview: preview ?? undefined,
    resolvedPlanogramPayload: preview?.planogramPayload ?? null,
  });

  const payload = editor.effectivePayload;

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary px-2 pb-4 pt-2 sm:px-2 sm:pb-4 sm:pt-3 lg:px-2 lg:pb-5 lg:pt-4">
        <div className="mx-auto max-w-screen-2xl space-y-4">
          <header className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to={backTo as never}>
                <ArrowLeft className="size-4" aria-hidden />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold text-foreground">
                {preview?.shelf.shelfName ?? title}
              </h1>
              {!isLoading && payload ? (
                <p className="text-sm text-muted-foreground">
                  {payload.name} · v{payload.version ?? "—"} · {payload.description ?? "—"}
                </p>
              ) : null}
            </div>
            {editor.hasChanges && !editor.isMissingPlanogram ? (
              <Button
                onClick={editor.handleSaveArrangement}
                disabled={editor.isSavingArrangement}
                variant="success"
              >
                <Check className="size-4" aria-hidden />
                {editor.isSavingArrangement ? "Saving..." : "Save"}
              </Button>
            ) : null}
          </header>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-border bg-card/80 p-6 text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load planogram."}
            </div>
          ) : !payload ? (
            <div className="rounded-lg border border-border bg-card/80 p-6 text-sm text-muted-foreground">
              No planogram data is available for this shelf.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard title="Shelves" value={editor.stats.shelves} className="stat-card" />
                <StatCard title="SKUs" value={editor.stats.skus} className="stat-card" />
                <StatCard title="Front Facings" value={editor.stats.frontFacings} className="stat-card" />
                <StatCard title="Total Units" value={editor.stats.totalUnits} className="stat-card" />
                <StatCard title="Categories" value={editor.stats.categories} className="stat-card" />
                <StatCard title="Removed" value={editor.stats.removed} className="stat-card" />
              </div>

              <CategoryFilterTags
                categories={editor.stats.categoryList}
                selected={
                  editor.selectedCategories.size === 0
                    ? new Set(editor.stats.categoryList)
                    : editor.selectedCategories
                }
                onToggle={editor.onToggleCategory}
              />

              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-2">
                  {sortPlanogramShelves(editor.shelvesToShow).map((shelf) => (
                    <ShelfRow
                      key={shelf.id}
                      shelf={shelf}
                      allShelves={editor.baseShelves}
                      fixture={editor.planogramFixture}
                      editHandlers={{
                        ...editor.editHandlers,
                        onReorderProducts:
                          editor.selectedCategories.size === 0
                            ? editor.editHandlers.onReorderProducts
                            : undefined,
                      }}
                      dragHandlers={{
                        onDragStart: (productId, fromShelf) => {
                          editor.dragRef.current = { productId, fromShelf };
                        },
                        onDropOnShelf: (toShelfId, targetProductId) => {
                          if (!editor.dragRef.current) return;
                          const { productId, fromShelf } = editor.dragRef.current;
                          editor.dragRef.current = null;
                          editor.editHandlers.onMoveProduct(
                            fromShelf,
                            toShelfId,
                            productId,
                            targetProductId,
                          );
                        },
                        onDropOnRemoved: () => {
                          if (!editor.dragRef.current || editor.dragRef.current.fromShelf === "removed") {
                            return;
                          }
                          const { productId, fromShelf } = editor.dragRef.current;
                          editor.dragRef.current = null;
                          editor.editHandlers.onRemoveProduct(fromShelf, productId);
                        },
                      }}
                    />
                  ))}
                </div>
                <RemovedItemsSidebar
                  removedItems={editor.removedItems}
                  shelves={editor.baseShelves}
                  onRestore={editor.onRestoreProduct}
                  onRemoveFromShelf={editor.editHandlers.onRemoveProduct}
                  onMoveFromSidebar={(productId, toShelfId) =>
                    editor.editHandlers.onMoveProduct("removed", toShelfId, productId)
                  }
                />
              </div>

              <div className="grid gap-3">
                <div className="min-w-0 overflow-x-auto">
                  <div className="min-w-275">
                    <ProductDetailsTable shelves={editor.shelvesToShow} />
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card/80 p-3 text-sm text-muted-foreground">
                  {payload.status} · Fixture {payload.fixture.width}×{payload.fixture.height}×{payload.fixture.depth}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
