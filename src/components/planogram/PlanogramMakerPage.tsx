import { Search } from "lucide-react";

import { PlanogramMakerEmptyState } from "./PlanogramMakerEmptyState";
import { PlanogramMakerTable } from "./PlanogramMakerTable";
import { usePlanogramMakerLogic } from "./usePlanogramMakerLogic";
import { ComplianceRuleViewSheet } from "@/components/planogram/ComplianceRuleViewSheet";
import { PlanogramActionsMenu } from "@/components/planogram/PlanogramTableColumns";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanogramMakerPage() {
  const { state, actions, refs } = usePlanogramMakerLogic();

  return (
    <>
      <div className="bg-primary flex min-h-0 flex-1 flex-col overflow-hidden pb-3 sm:pb-3 lg:pb-4">
        <div className="flex min-h-0 w-full flex-1 flex-col px-6">
          <div className="mt-2 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="group relative w-full sm:max-w-md">
              <Search className="text-muted-foreground group-focus-within:text-accent absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 transition-colors" />
              <Input
                placeholder="Search Display Unit by type, code, or location..."
                value={state.searchQuery}
                onChange={(e) => actions.setSearchQuery(e.target.value)}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground hover:border-accent/50 focus:border-accent h-12 pl-11 transition-all"
              />
            </div>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden">
            {state.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : state.filteredRows.length === 0 ? (
              <PlanogramMakerEmptyState />
            ) : (
              <PlanogramMakerTable
                data={state.filteredRows}
                onOpenMenu={actions.handleOpenMenu}
                onPaginationChange={actions.setTablePagination}
                tableWrapperRef={refs.tableWrapperRef}
              />
            )}
          </div>
        </div>
      </div>

      {state.actionsMenu && (
        <PlanogramActionsMenu
          ref={refs.actionsMenuRef}
          row={state.actionsMenu.row}
          triggerEl={state.actionsMenu.triggerEl}
          anchorPoint={state.actionsMenu.anchorPoint}
          variant="maker"
          onClose={() => actions.setActionsMenu(null)}
          onRunPlanogram={actions.handlePlanogramAnalysis}
          onViewComplianceRule={actions.handleViewComplianceRule}
        />
      )}

      <ComplianceRuleViewSheet
        open={state.complianceSheetOpen}
        onOpenChange={actions.setComplianceSheetOpen}
        ruleSet={state.complianceSheetRuleSet}
        ruleSetName={state.complianceSheetRuleSetName}
      />
    </>
  );
}
