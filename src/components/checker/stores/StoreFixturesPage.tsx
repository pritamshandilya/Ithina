import { FixtureModals } from "./FixtureModals";
import { ShelfModals } from "./ShelfModals";
import { StoreFixturesPageView } from "./StoreFixturesPageView";
import { StoreFixturesTable } from "./StoreFixturesTable";
import { useStoreFixturesPageLogic } from "./useStoreFixturesPageLogic";
import { PlanogramActionsMenu } from "@/components/planogram/PlanogramTableColumns";
import { ComplianceRuleViewSheet } from "@/components/planogram/ComplianceRuleViewSheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

interface StoreFixturesPageProps {
  canEdit?: boolean;
}

export function StoreFixturesPage({ canEdit = false }: StoreFixturesPageProps) {
  const { state, actions, refs, computed } = useStoreFixturesPageLogic(canEdit);

  if (!state.selectedStore) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <StoreFixturesPageView
        canEdit={canEdit}
        searchQuery={state.searchQuery}
        onSearchChange={actions.setSearchQuery}
        isCreatingFixture={state.isCreatingFixture}
        onOpenCreateFixture={() => {
          actions.setDefaultDimensionUnit(
            (state.selectedStore?.default_dimensions as StoreDimensionUnit) || "mm",
          );
          actions.setEditingFixture(null);
          actions.setFixtureModalOpen(true);
        }}
        onOpenAddShelf={() => {
          actions.openAddShelfModal();
        }}
        onBulkAddShelves={() => actions.setIsBulkAddModalOpen(true)}
      >
        <StoreFixturesTable
          fixtureShelfRows={state.fixtureRows}
          tablePagination={state.tablePagination}
          onPaginationChange={actions.setTablePagination}
          onRowClick={actions.openFixtureDetailFromRow}
          tableWrapperRef={refs.tableWrapperRef}
          actionsMenuRef={refs.actionsMenuRef}
          actionsMenu={state.actionsMenu}
          setActionsMenu={actions.setActionsMenu}
          rowIdToFixtureId={computed.effectiveRowIdToFixtureId}
          fixtureById={computed.fixtureById}
          shelvesByFixtureId={computed.shelvesByFixtureId}
          effectivePlanogramByFixtureId={computed.effectivePlanogramByFixtureId}
          defaultRuleSetName={computed.defaultRuleSetName}
          fixtureComplianceOverrides={computed.fixtureComplianceOverrides}
          fixtureCategorizeOverrides={computed.fixtureCategorizeOverrides}
          setFixtureComplianceOverrides={actions.setFixtureComplianceOverrides}
          setFixtureCategorizeOverrides={actions.setFixtureCategorizeOverrides}
          openFixtureDetail={actions.openFixtureDetail}
          handleOpenFixtureActions={actions.handleOpenFixtureActions}
        />
      </StoreFixturesPageView>

      <FixtureModals
        fixtureModalOpen={state.fixtureModalOpen}
        onCloseFixtureModal={() => {
          actions.setFixtureModalOpen(false);
          actions.setEditingFixture(null);
        }}
        onSaveFixture={actions.handleCreateFixture}
        isFixtureSaving={state.isCreatingFixture}
        editingFixture={state.editingFixture}
        editingFixturePlanogramId={state.editingFixturePlanogramId}
        defaultDimensionUnit={state.defaultDimensionUnit}
        planogramOptions={state.planogramOptions}
        isDeleteConfirmOpen={!!state.fixtureToDelete}
        onCloseDeleteConfirm={() => {
          if (state.isDeletingFixture) return;
          actions.setFixtureToDelete(null);
        }}
        onConfirmDelete={() => {
          if (!state.fixtureToDelete) return;
          void actions.handleDeleteFixture(state.fixtureToDelete);
        }}
        fixtureToDeleteLabel={
          state.fixtureToDelete
            ? `${state.fixtureToDelete.code.trim()} (${state.fixtureToDelete.type.trim()})`
            : undefined
        }
        isDeletingFixture={state.isDeletingFixture}
        planogramAssociationModalOpen={state.planogramAssociationModalOpen}
        onClosePlanogramAssociationModal={() =>
          actions.setPlanogramAssociationModalOpen(false)
        }
        pendingPlanogramId={state.pendingPlanogramId}
        onChangePendingPlanogramId={actions.setPendingPlanogramId}
        onSavePlanogramAssociation={actions.handleSavePlanogramAssociation}
      />

      <ShelfModals
        isAddShelfModalOpen={state.isAddShelfModalOpen}
        onCloseAddShelfModal={() => {
          actions.setIsAddShelfModalOpen(false);
          actions.setSelectedFixtureForShelfForm("");
          actions.setDefaultDimensionUnit(
            (state.selectedStore?.default_dimensions as StoreDimensionUnit) || "mm",
          );
        }}
        onCreateShelf={actions.handleCreateShelfFromModal}
        isCreatingShelf={state.isCreatingShelf}
        defaultDimensionUnit={state.defaultDimensionUnit}
        shelfTemplates={state.shelfTemplates}
        shelfTemplatesLoading={state.shelfTemplatesLoading}
        pendingTemplateId={state.pendingTemplateId}
        fixtureOptions={state.fixtures.map((fixture) => ({
          id: fixture.id,
          label: `${fixture.code.trim()} (${fixture.type.trim()})`,
        }))}
        selectedFixtureId={state.selectedFixtureForShelfForm}
        onFixtureChange={actions.setSelectedFixtureForShelfForm}
        disableFixtureSelect={!!state.pendingFixtureForShelf}
        isAddShelfModeModalOpen={state.isAddShelfModeModalOpen}
        onCloseAddShelfModeModal={() => {
          actions.setIsAddShelfModeModalOpen(false);
        }}
        onContinueAddShelf={actions.handleContinueAddShelf}
        isBulkAddModalOpen={state.isBulkAddModalOpen}
        onCloseBulkAddModal={() => actions.setIsBulkAddModalOpen(false)}
        onSubmitBulkShelves={actions.handleSubmitBulkShelves}
      />

      <ComplianceRuleViewSheet
        open={state.complianceSheetOpen}
        onOpenChange={actions.setComplianceSheetOpen}
        ruleSet={state.complianceSheetRuleSet}
        ruleSetName={state.complianceSheetRuleSetName}
      />

      {state.actionsMenu && (
        <PlanogramActionsMenu
          ref={refs.actionsMenuRef}
          row={state.actionsMenu.row}
          triggerEl={state.actionsMenu.triggerEl}
          anchorPoint={state.actionsMenu.anchorPoint}
          variant="checker"
          onClose={() => actions.setActionsMenu(null)}
          onView={actions.openFixtureDetailFromRow}
          onRunAdhoc={actions.handleRunFixtureAdhocAnalysis}
          onViewComplianceRule={actions.handleViewFixtureComplianceRule}
          onAssociatePlanogram={
            canEdit ? actions.handleAssociateFixturePlanogram : undefined
          }
          onEditShelf={canEdit ? actions.handleEditFixture : undefined}
          editLabel="Edit Fixture"
          onAddShelf={canEdit ? actions.handleAddShelfForFixture : undefined}
          onDeleteFixture={
            canEdit ? actions.handleDeleteFixtureFromRow : undefined
          }
          deleteLabel="Delete Fixture"
        />
      )}
    </>
  );
}
