import type { MutableRefObject } from "react";

import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
} from "@/components/planogram";
import type { PlanogramEditHandlers } from "@/components/planogram/types";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
import {
  getShelfDisplayLabel,
  sortPlanogramShelves,
} from "@/lib/planogram/planogram-schema";
import type {
  PlanogramFixture,
  PlanogramPayload,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";

interface PlanogramAssociationBlockProps {
  planogramOptions: { id: string; name: string }[];
  planogramId: string;
  onPlanogramIdChange: (value: string) => void;
  onSaveAssociation: () => void;
  effectiveFixturePlanogramId: string;
}

function PlanogramAssociationBlock({
  planogramOptions,
  planogramId,
  onPlanogramIdChange,
  onSaveAssociation,
  effectiveFixturePlanogramId,
}: PlanogramAssociationBlockProps) {
  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Planogram Association</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Select value={planogramId} onChange={(e) => onPlanogramIdChange(e.target.value)}>
          <option value="">No planogram</option>
          {planogramOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
        <Button type="button" variant="outline" className="w-full" onClick={onSaveAssociation}>
          Save Planogram Association
        </Button>
        <p className="text-xs text-muted-foreground">
          Current association:{" "}
          {effectiveFixturePlanogramId
            ? (planogramOptions.find((option) => option.id === effectiveFixturePlanogramId)?.name ??
              effectiveFixturePlanogramId)
            : "None"}
        </p>
      </CardContent>
    </Card>
  );
}

export interface StoreFixtureDetailPlanogramTabProps {
  isMissingPlanogram: boolean;
  effectivePayload: PlanogramPayload | null | undefined;
  planogramFixture: PlanogramFixture | null | undefined;
  stats: ReturnType<typeof derivePlanogramStats>;
  shelvesToShow: PlanogramShelfDef[];
  baseShelves: PlanogramShelfDef[];
  removedItems: PlanogramProduct[];
  selectedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  editHandlers: PlanogramEditHandlers;
  onRestoreProduct: (shelfId: string, product: PlanogramProduct) => void;
  onRemoveProduct: (shelfId: string, productId: string) => void;
  onMoveProduct: (
    from: string | "removed",
    to: string,
    productId: string,
    targetProductId?: string,
  ) => void;
  dragRef: MutableRefObject<{ productId: string; fromShelf: string | "removed" } | null>;
  planogramOptions: { id: string; name: string }[];
  planogramId: string;
  onPlanogramIdChange: (value: string) => void;
  onSaveAssociation: () => void;
  effectiveFixturePlanogramId: string;
}

export function StoreFixtureDetailPlanogramTab({
  isMissingPlanogram,
  effectivePayload,
  planogramFixture,
  stats,
  shelvesToShow,
  baseShelves,
  removedItems,
  selectedCategories,
  onToggleCategory,
  editHandlers,
  onRestoreProduct,
  onRemoveProduct,
  onMoveProduct,
  dragRef,
  planogramOptions,
  planogramId,
  onPlanogramIdChange,
  onSaveAssociation,
  effectiveFixturePlanogramId,
}: StoreFixtureDetailPlanogramTabProps) {
  const hasAssociatedPlanogram = !!effectivePayload?.fixture;

  return (
    <div className="space-y-3">
      <PlanogramAssociationBlock
        planogramOptions={planogramOptions}
        planogramId={planogramId}
        onPlanogramIdChange={onPlanogramIdChange}
        onSaveAssociation={onSaveAssociation}
        effectiveFixturePlanogramId={effectiveFixturePlanogramId}
      />
      {!hasAssociatedPlanogram && (
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
          No planogram is associated with this fixture.
        </div>
      )}
      {hasAssociatedPlanogram && !isMissingPlanogram && (
        <>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
            <StatCard title="SKUs" value={stats.skus} className="stat-card" />
            <StatCard title="Front Facings" value={stats.frontFacings} className="stat-card" />
            <StatCard title="Total Units" value={stats.totalUnits} className="stat-card" />
            <StatCard title="Categories" value={stats.categories} className="stat-card" />
            <StatCard title="Removed" value={stats.removed} className="stat-card" />
          </div>
          <CategoryFilterTags
            categories={stats.categoryList}
            selected={
              selectedCategories.size === 0 ? new Set(stats.categoryList) : selectedCategories
            }
            onToggle={onToggleCategory}
          />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
            <div className="min-w-0 flex-1 space-y-2">
              {sortPlanogramShelves(shelvesToShow).map((shelf) => (
                <ShelfRow
                  key={shelf.id}
                  shelf={shelf}
                  allShelves={baseShelves}
                  fixture={planogramFixture}
                  editHandlers={{
                    ...editHandlers,
                    onReorderProducts:
                      selectedCategories.size === 0
                        ? editHandlers.onReorderProducts
                        : undefined,
                  }}
                  dragHandlers={{
                    onDragStart: (productId, fromShelf) => {
                      dragRef.current = { productId, fromShelf };
                    },
                    onDropOnShelf: (toShelfId, targetProductId) => {
                      if (!dragRef.current) return;
                      const { productId, fromShelf } = dragRef.current;
                      dragRef.current = null;
                      onMoveProduct(fromShelf, toShelfId, productId, targetProductId);
                    },
                    onDropOnRemoved: () => {
                      if (!dragRef.current || dragRef.current.fromShelf === "removed") return;
                      const { productId, fromShelf } = dragRef.current;
                      dragRef.current = null;
                      onRemoveProduct(fromShelf, productId);
                    },
                  }}
                />
              ))}
            </div>
            <RemovedItemsSidebar
              removedItems={removedItems}
              shelves={baseShelves}
              onRestore={onRestoreProduct}
              onRemoveFromShelf={onRemoveProduct}
              onMoveFromSidebar={(productId, toShelfId) => onMoveProduct("removed", toShelfId, productId)}
            />
          </div>
          <div className="grid gap-3">
            <div className="min-w-0 overflow-x-auto">
              <div className="min-w-275">
                <ProductDetailsTable shelves={shelvesToShow} />
              </div>
            </div>
            {effectivePayload ? (
              <div className="rounded-lg border border-border bg-card/80 p-3 text-sm text-muted-foreground">
                {effectivePayload.name} · {effectivePayload.version ?? "—"} · {effectivePayload.status}
                <div className="mt-1">
                  {effectivePayload.description ?? "No description"}
                </div>
                {planogramFixture ? (
                  <div className="mt-2">
                    Fixture: {planogramFixture.width}×{planogramFixture.height}×{planogramFixture.depth}
                  </div>
                ) : null}
                {baseShelves.length > 0 ? (
                  <div className="mt-2">
                    {getShelfDisplayLabel(baseShelves, baseShelves[0].id)} starts at {baseShelves[0].y_position}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
