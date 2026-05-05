import { Pencil, Plus } from "lucide-react";
import type { MutableRefObject } from "react";
import { useState } from "react";

import {
  CategoryFilterTags,
  ProductDetailsTable,
  RemovedItemsSidebar,
  ShelfRow,
} from "@/components/planogram";
import type { PlanogramEditHandlers } from "@/components/planogram/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
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

interface PlanogramAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  planogramOptions: { id: string; name: string }[];
  planogramId: string;
  onPlanogramIdChange: (value: string) => void;
  onSaveAssociation: () => void;
}

function PlanogramAssociationModal({
  isOpen,
  onClose,
  planogramOptions,
  planogramId,
  onPlanogramIdChange,
  onSaveAssociation,
}: PlanogramAssociationModalProps) {
  const handleSave = () => {
    onSaveAssociation();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg"
      showCloseButton
    >
      <div className="border-border bg-card rounded-xl border p-6 shadow-2xl">
        <h3 className="text-foreground text-lg font-semibold">
          Associate Planogram
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Select a planogram to assign to this fixture.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="fixture-planogram-association">Planogram</Label>
          <Select
            id="fixture-planogram-association"
            value={planogramId}
            onChange={(e) => onPlanogramIdChange(e.target.value)}
          >
            <option value="">None</option>
            {planogramOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
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
  dragRef: MutableRefObject<{
    productId: string;
    fromShelf: string | "removed";
  } | null>;
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
  const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
  const hasAssociatedPlanogram = !!effectiveFixturePlanogramId;
  const associatedPlanogramName =
    planogramOptions.find((option) => option.id === effectiveFixturePlanogramId)
      ?.name ??
    effectivePayload?.name ??
    effectiveFixturePlanogramId;

  return (
    <div className="space-y-3">
      {!hasAssociatedPlanogram ? (
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Planogram Association</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              No planogram is associated with this Display Unit.
            </p>
            <Button
              type="button"
              variant="success"
              className="items-center gap-1.5"
              onClick={() => setIsAssociationModalOpen(true)}
            >
              <Plus className="size-4" aria-hidden />
              Associate Planogram
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card/80">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Associated Planogram</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="items-center gap-1.5"
                onClick={() => setIsAssociationModalOpen(true)}
              >
                <Pencil className="size-4" aria-hidden />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground text-sm">
              {associatedPlanogramName}
            </div>
            {effectivePayload ? (
              <>
                <div className="text-muted-foreground text-sm">
                  {effectivePayload.version ?? "—"} · {effectivePayload.status}
                </div>
                <div className="text-muted-foreground text-sm">
                  {effectivePayload.description ?? "No description"}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}
      <PlanogramAssociationModal
        isOpen={isAssociationModalOpen}
        onClose={() => setIsAssociationModalOpen(false)}
        planogramOptions={planogramOptions}
        planogramId={planogramId}
        onPlanogramIdChange={onPlanogramIdChange}
        onSaveAssociation={onSaveAssociation}
      />
      {hasAssociatedPlanogram && !isMissingPlanogram && (
        <>
          {/* <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard title="Shelves" value={stats.shelves} className="stat-card" />
            <StatCard title="SKUs" value={stats.skus} className="stat-card" />
            <StatCard title="Front Facings" value={stats.frontFacings} className="stat-card" />
            <StatCard title="Total Units" value={stats.totalUnits} className="stat-card" />
            <StatCard title="Categories" value={stats.categories} className="stat-card" />
            <StatCard title="Removed" value={stats.removed} className="stat-card" />
          </div> */}
          <CategoryFilterTags
            categories={stats.categoryList}
            selected={
              selectedCategories.size === 0
                ? new Set(stats.categoryList)
                : selectedCategories
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
                      onMoveProduct(
                        fromShelf,
                        toShelfId,
                        productId,
                        targetProductId,
                      );
                    },
                    onDropOnRemoved: () => {
                      if (
                        !dragRef.current ||
                        dragRef.current.fromShelf === "removed"
                      )
                        return;
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
              onMoveFromSidebar={(productId, toShelfId) =>
                onMoveProduct("removed", toShelfId, productId)
              }
            />
          </div>
          <div className="grid gap-3">
            <div className="min-w-0 overflow-x-auto">
              <div className="min-w-275">
                <ProductDetailsTable shelves={shelvesToShow} />
              </div>
            </div>
            <div className="border-border bg-card/80 text-muted-foreground rounded-lg border p-3 text-sm">
              {planogramFixture ? (
                <div>
                  Fixture: {planogramFixture.width}×{planogramFixture.height}×
                  {planogramFixture.depth}
                </div>
              ) : null}
              {baseShelves.length > 0 ? (
                <div className={planogramFixture ? "mt-2" : undefined}>
                  {getShelfDisplayLabel(baseShelves, baseShelves[0].id)} starts
                  at {baseShelves[0].y_position}
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
