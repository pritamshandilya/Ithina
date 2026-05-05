import { Folder, Plus, Search } from "lucide-react";
import type { RefObject } from "react";

import {
  BulkAddShelvesModal,
  type ParsedBulkPayload,
} from "@/components/checker/stores/bulk-add-shelves-modal";
import { StoreConfigurationModals } from "@/components/checker/stores/store-configuration-modals";
import type { StoreFixtureModalValues } from "@/components/common/store-fixture-modal";
import MainLayout from "@/components/layouts/main";
import { ComplianceRuleViewSheet } from "@/components/planogram/compliance-rule-view-sheet";
import { PlanogramActionsMenu } from "@/components/planogram/planogram-table-columns";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type { StoreFixtureApiModel } from "@/queries/checker/api/fixtures";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { PlanogramShelfRow } from "@/types/maker";

const FIXTURE_TABLE_PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 75, 100];

interface StoreFixturesPageViewProps {
  canEdit: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isCreatingFixture: boolean;
  onOpenCreateFixture: () => void;
  onOpenAddShelf: () => void;
  onBulkAddShelves: () => void;
  tableWrapperRef: RefObject<HTMLDivElement | null>;
  fixtureShelfRows: PlanogramShelfRow[];
  tablePagination: { page: number; pageSize: number };
  setTablePagination: (value: { page: number; pageSize: number }) => void;
  columns: DataTableColumn<PlanogramShelfRow>[];
  onRowClick: (row: PlanogramShelfRow) => void;
  isDeleteConfirmOpen: boolean;
  onCloseDeleteConfirm: () => void;
  onConfirmDelete: () => void;
  fixtureToDeleteLabel?: string;
  isDeletingFixture: boolean;
  fixtureModalOpen: boolean;
  onCloseFixtureModal: () => void;
  onSaveFixture: (values: StoreFixtureModalValues) => void | Promise<void>;
  editingFixture: StoreFixtureApiModel | null;
  editingFixturePlanogramId?: string | null;
  defaultDimensionUnit: StoreDimensionUnit;
  planogramOptions: { id: string; name: string }[];
  actionsMenu: {
    row: PlanogramShelfRow;
    triggerEl: HTMLElement;
    mode: "fixture" | "shelf";
    anchorPoint?: { x: number; y: number };
  } | null;
  actionsMenuRef: RefObject<HTMLDivElement | null>;
  onCloseActionsMenu: () => void;
  onEditShelf: (row: PlanogramShelfRow) => void;
  onDeleteShelf: (shelfId: string) => void;
  onAddShelfForFixture: (row: PlanogramShelfRow) => void;
  onViewComplianceRule: (row: PlanogramShelfRow) => void;
  onAssociatePlanogram: (row: PlanogramShelfRow) => void;
  onViewFixture: (row: PlanogramShelfRow) => void;
  onDeleteFixture: (row: PlanogramShelfRow) => void;
  onRunAdhocAnalysis: (row: PlanogramShelfRow) => void;
  isBulkAddModalOpen: boolean;
  onCloseBulkAddModal: () => void;
  onSubmitBulkShelves: (payload: ParsedBulkPayload) => Promise<number>;
  planogramAssociationModalOpen: boolean;
  onClosePlanogramAssociationModal: () => void;
  pendingPlanogramId: string;
  onChangePendingPlanogramId: (value: string) => void;
  onSavePlanogramAssociation: () => void;
  complianceSheetOpen: boolean;
  onOpenChangeComplianceSheet: (value: boolean) => void;
  complianceSheetRuleSet: ComplianceRuleSetSummary | null;
  complianceSheetRuleSetName: string | null;
}

export function StoreFixturesPageView({
  canEdit,
  searchQuery,
  onSearchChange,
  isCreatingFixture,
  onOpenCreateFixture,
  onOpenAddShelf,
  onBulkAddShelves,
  tableWrapperRef,
  fixtureShelfRows,
  tablePagination,
  setTablePagination,
  columns,
  onRowClick,
  isDeleteConfirmOpen,
  onCloseDeleteConfirm,
  onConfirmDelete,
  fixtureToDeleteLabel,
  isDeletingFixture,
  fixtureModalOpen,
  onCloseFixtureModal,
  onSaveFixture,
  editingFixture,
  editingFixturePlanogramId,
  defaultDimensionUnit,
  planogramOptions,
  actionsMenu,
  actionsMenuRef,
  onCloseActionsMenu,
  onEditShelf,
  onDeleteShelf,
  onAddShelfForFixture,
  onViewComplianceRule,
  onAssociatePlanogram,
  onViewFixture,
  onDeleteFixture,
  onRunAdhocAnalysis,
  isBulkAddModalOpen,
  onCloseBulkAddModal,
  onSubmitBulkShelves,
  planogramAssociationModalOpen,
  onClosePlanogramAssociationModal,
  pendingPlanogramId,
  onChangePendingPlanogramId,
  onSavePlanogramAssociation,
  complianceSheetOpen,
  onOpenChangeComplianceSheet,
  complianceSheetRuleSet,
  complianceSheetRuleSetName,
}: StoreFixturesPageViewProps) {
  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Display Unit"
          description="View and manage store display units configuration."
        />
      }
    >
      <div className="bg-primary px-2 pt-2 pb-4 sm:px-2 sm:pt-3 sm:pb-4 lg:px-2 lg:pt-4 lg:pb-5">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:max-w-md">
              <Search className="text-muted-foreground group-focus-within:text-accent absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <Input
                placeholder="Search fixture by type, code, or location..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent h-12 pl-11 transition-all"
              />
            </div>
            {canEdit && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onBulkAddShelves}
                >
                  <Folder className="size-4" aria-hidden />
                  Bulk Add Shelves
                </Button>
                <Button
                  type="button"
                  variant="success"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onOpenCreateFixture}
                  disabled={isCreatingFixture}
                >
                  <Plus className="size-4" aria-hidden />
                  Add fixture
                </Button>
                <Button
                  type="button"
                  variant="success"
                  className="h-10 items-center gap-1.5 px-4"
                  onClick={onOpenAddShelf}
                >
                  <Plus className="size-4" aria-hidden />
                  Add Shelf
                </Button>
              </div>
            )}
          </div>

          <div ref={tableWrapperRef} className="min-h-0 flex-1">
            {fixtureShelfRows.length > 0 && (
              <p className="text-muted-foreground mb-2 shrink-0 text-sm">
                Showing{" "}
                <span className="text-foreground font-semibold">
                  {Math.max(
                    0,
                    Math.min(
                      tablePagination.pageSize,
                      fixtureShelfRows.length -
                        (tablePagination.page - 1) * tablePagination.pageSize,
                    ),
                  )}
                </span>{" "}
                of{" "}
                <span className="text-foreground font-semibold">
                  {fixtureShelfRows.length}
                </span>{" "}
                fixture{fixtureShelfRows.length !== 1 ? "s" : ""}
              </p>
            )}
            <DataTable<PlanogramShelfRow>
              columns={columns}
              data={fixtureShelfRows}
              rowIdField="id"
              pageSize={50}
              pageSizeSelector={FIXTURE_TABLE_PAGE_SIZE_OPTIONS}
              emptyMessage="No shelves found matching your search"
              headerFilters={false}
              layout="fitData"
              onPaginationChange={setTablePagination}
              onRowClick={onRowClick}
            />
          </div>
        </div>

        <StoreConfigurationModals
          fixtureModalOpen={fixtureModalOpen}
          onCloseFixtureModal={onCloseFixtureModal}
          onSaveFixture={onSaveFixture}
          isFixtureSaving={isCreatingFixture}
          editingFixture={editingFixture}
          editingFixturePlanogramId={editingFixturePlanogramId}
          defaultDimensionUnit={defaultDimensionUnit}
          planogramOptions={planogramOptions}
        />

        <ConfirmModal
          isOpen={isDeleteConfirmOpen}
          onClose={onCloseDeleteConfirm}
          onConfirm={onConfirmDelete}
          title="Delete fixture?"
          description={`This will permanently delete "${fixtureToDeleteLabel ?? "this fixture"}".`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          isLoading={isDeletingFixture}
        />

        {actionsMenu ? (
          <PlanogramActionsMenu
            ref={actionsMenuRef}
            row={actionsMenu.row}
            triggerEl={actionsMenu.triggerEl}
            anchorPoint={actionsMenu.anchorPoint}
            variant="checker"
            onClose={onCloseActionsMenu}
            onEditShelf={actionsMenu.mode === "shelf" ? onEditShelf : undefined}
            onDeleteShelf={
              actionsMenu.mode === "shelf" ? onDeleteShelf : undefined
            }
            onAddShelf={
              actionsMenu.mode === "fixture" ? onAddShelfForFixture : undefined
            }
            onView={actionsMenu.mode === "fixture" ? onViewFixture : undefined}
            onDeleteFixture={
              actionsMenu.mode === "fixture" ? onDeleteFixture : undefined
            }
            onRunAdhoc={
              actionsMenu.mode === "fixture" ? onRunAdhocAnalysis : undefined
            }
            onViewComplianceRule={
              actionsMenu.mode === "fixture" ? onViewComplianceRule : undefined
            }
            onAssociatePlanogram={
              actionsMenu.mode === "fixture" ? onAssociatePlanogram : undefined
            }
            editLabel={actionsMenu.mode === "fixture" ? "Edit Fixture" : "Edit"}
            deleteLabel={
              actionsMenu.mode === "fixture" ? "Delete Fixture" : "Delete"
            }
          />
        ) : null}

        <BulkAddShelvesModal
          isOpen={isBulkAddModalOpen}
          onClose={onCloseBulkAddModal}
          onSubmitBulk={onSubmitBulkShelves}
        />

        <Modal
          isOpen={planogramAssociationModalOpen}
          onClose={onClosePlanogramAssociationModal}
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
                value={pendingPlanogramId}
                onChange={(e) => onChangePendingPlanogramId(e.target.value)}
              >
                <option value="">None</option>
                {planogramOptions.map((planogram) => (
                  <option key={planogram.id} value={planogram.id}>
                    {planogram.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClosePlanogramAssociationModal}
              >
                Cancel
              </Button>
              <Button variant="success" onClick={onSavePlanogramAssociation}>
                Save
              </Button>
            </div>
          </div>
        </Modal>

        <ComplianceRuleViewSheet
          open={complianceSheetOpen}
          onOpenChange={onOpenChangeComplianceSheet}
          ruleSet={complianceSheetRuleSet}
          ruleSetName={complianceSheetRuleSetName}
        />
      </div>
    </MainLayout>
  );
}
