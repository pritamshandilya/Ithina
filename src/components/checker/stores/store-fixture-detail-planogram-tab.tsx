import type { MutableRefObject } from "react";

import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
  StockingRulesSection,
} from "@/components/planogram";
import type { PlanogramEditHandlers } from "@/components/planogram/types";
import { StatCard } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { derivePlanogramStats } from "@/lib/planogram/planogram-derive-stats";
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
  highDemandSkus: string[];
  stats: ReturnType<typeof derivePlanogramStats>;
  shelvesToShow: PlanogramShelfDef[];
  baseShelves: PlanogramShelfDef[];
  shelfCapacities: Record<number, number>;
  removedItems: PlanogramProduct[];
  selectedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  editHandlers: PlanogramEditHandlers;
  onRestoreProduct: (shelfNumber: number, product: PlanogramProduct) => void;
  onRemoveProduct: (shelfNumber: number, sku: string) => void;
  onMoveProduct: (from: number | "removed", to: number, sku: string, targetSku?: string) => void;
  dragRef: MutableRefObject<{ sku: string; fromShelf: number | "removed" } | null>;
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
  highDemandSkus,
  stats,
  shelvesToShow,
  baseShelves,
  shelfCapacities,
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
  const hasAssociatedPlanogram = !!effectivePayload?.planogram?.fixture;

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
            <StatCard title="Total Units (w/ depth)" value={stats.totalUnits} className="stat-card" />
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
              {[...shelvesToShow]
                .sort((a, b) => b.verticalPosition - a.verticalPosition)
                .map((shelf) => (
                  <ShelfRow
                    key={shelf.shelfNumber}
                    shelf={shelf}
                    fixture={planogramFixture}
                    highDemandSkus={highDemandSkus}
                    editHandlers={{
                      ...editHandlers,
                      onReorderProducts:
                        selectedCategories.size === 0
                          ? editHandlers.onReorderProducts
                          : undefined,
                    }}
                    dragHandlers={{
                      onDragStart: (sku, fromShelf) => {
                        dragRef.current = { sku, fromShelf };
                      },
                      onDropOnShelf: (toShelfNumber, targetSku) => {
                        if (!dragRef.current) return;
                        const { sku, fromShelf } = dragRef.current;
                        dragRef.current = null;
                        onMoveProduct(fromShelf, toShelfNumber, sku, targetSku);
                      },
                      onDropOnRemoved: () => {
                        if (!dragRef.current || dragRef.current.fromShelf === "removed") return;
                        const { sku, fromShelf } = dragRef.current;
                        dragRef.current = null;
                        onRemoveProduct(fromShelf as number, sku);
                      },
                    }}
                  />
                ))}
            </div>
            <RemovedItemsSidebar
              removedItems={removedItems}
              shelves={baseShelves}
              shelfCapacities={shelfCapacities}
              onRestore={onRestoreProduct}
              onRemoveFromShelf={(sku, shelfNumber) => onRemoveProduct(shelfNumber, sku)}
              onMoveFromSidebar={(sku, toShelfNumber) => onMoveProduct("removed", toShelfNumber, sku)}
            />
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
            <div className="min-w-0 overflow-x-auto">
              <div className="min-w-275">
                <ProductDetailsTable
                  shelves={shelvesToShow}
                  highDemandSkus={highDemandSkus}
                  units={planogramFixture?.units}
                />
              </div>
            </div>
            <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card/80 p-3">
              <StockingRulesSection stockingRules={effectivePayload?.metadata?.stockingRules} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
