import { useMemo } from "react";

import { useStoreFixturesTableDom } from "./useStoreFixturesTableDom";
import type { ActionsMenuState } from "./useStoreFixturesPageLogic";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/hooks/useToast";
import type { StoreFixtureApiModel } from "@/lib/api/checker/fixtures";
import { formatPlanogramShelfDimensionDisplay } from "@/lib/planogram/formatPlanogramShelfDimensions";
import type { PlanogramShelfRow } from "@/types/maker";

const FIXTURE_TABLE_PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 75, 100];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface StoreFixturesTableProps {
  fixtureShelfRows: PlanogramShelfRow[];
  tablePagination: { page: number; pageSize: number };
  onPaginationChange: (value: { page: number; pageSize: number }) => void;
  onRowClick: (row: PlanogramShelfRow) => void;
  tableWrapperRef: React.RefObject<HTMLDivElement | null>;
  actionsMenuRef: React.RefObject<HTMLDivElement | null>;
  actionsMenu: ActionsMenuState | null;
  setActionsMenu: React.Dispatch<React.SetStateAction<ActionsMenuState | null>>;
  rowIdToFixtureId: Map<string, string>;
  fixtureById: Map<string, StoreFixtureApiModel>;
  shelvesByFixtureId: Map<string, any[]>;
  effectivePlanogramByFixtureId: Map<string, string | null>;
  defaultRuleSetName: string;
  fixtureComplianceOverrides: Record<string, string>;
  fixtureCategorizeOverrides: Record<string, string>;
  setFixtureComplianceOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFixtureCategorizeOverrides: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  openFixtureDetail: (shelfId: string, options?: { fixtureId?: string }) => void;
  handleOpenFixtureActions: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
}

export function StoreFixturesTable({
  fixtureShelfRows,
  tablePagination,
  onPaginationChange,
  onRowClick,
  tableWrapperRef,
  actionsMenuRef,
  actionsMenu,
  setActionsMenu,
  rowIdToFixtureId,
  fixtureById,
  shelvesByFixtureId,
  effectivePlanogramByFixtureId,
  defaultRuleSetName,
  fixtureComplianceOverrides,
  fixtureCategorizeOverrides,
  setFixtureComplianceOverrides,
  setFixtureCategorizeOverrides,
  openFixtureDetail,
  handleOpenFixtureActions,
}: StoreFixturesTableProps) {
  const { toast } = useToast();

  useStoreFixturesTableDom({
    tableWrapperRef,
    rowIdToFixtureId,
    setFixtureComplianceOverrides,
    setFixtureCategorizeOverrides,
    fixtureById,
    shelvesByFixtureId,
    effectivePlanogramByFixtureId,
    defaultRuleSetName,
    fixtureComplianceOverrides,
    fixtureCategorizeOverrides,
    setActionsMenu,
    openFixtureDetail,
    toast,
    actionsMenu,
    actionsMenuRef,
  });

  const columns: DataTableColumn<PlanogramShelfRow>[] = useMemo(
    () => [
      {
        title: "Code",
        field: "shelfCode",
        minWidth: 150,
        sorter: "string",
        formatter: (cell: any) => {
          const row = cell.getData() as PlanogramShelfRow;
          return `<span class="p-1">${row.shelfCode ?? "—"}</span>`;
        },
      },
      {
        title: "Type",
        field: "fixtureType",
        minWidth: 100,
        maxWidth: 180,
        widthGrow: 1,
        sorter: "string",
      },
      {
        title: "Planogram",
        field: "planogramName",
        minWidth: 150,
        width: 200,
        sorter: "string",
        formatter: (cell: any) => {
          const row = cell.getData() as PlanogramShelfRow;
          const planogramName = row.planogramName?.trim() || "—";
          const safePlanogramName = escapeHtml(planogramName);
          return `<div class="truncate" title="${safePlanogramName}">${safePlanogramName}</div>`;
        },
      },
      {
        title: "Section",
        field: "section",
        minWidth: 100,
        maxWidth: 150,
        sorter: "string",
      },
      {
        title: "Aisle",
        field: "aisleCode",
        minWidth: 80,
        maxWidth: 100,
        sorter: "string",
      },
      {
        title: "Zone",
        field: "zone",
        minWidth: 100,
        maxWidth: 120,
        sorter: "string",
      },
      {
        title: "Dimension",
        field: "dimensions",
        minWidth: 150,
        maxWidth: 200,
        sorter: "string",
        formatter: (cell: any) => {
          const row = cell.getData() as PlanogramShelfRow;
          const text = formatPlanogramShelfDimensionDisplay(row);
          return `<span class="text-sm tabular-nums font-medium text-foreground">${text}</span>`;
        },
      },
      {
        title: "Compliance",
        field: "complianceRuleSet",
        minWidth: 150,
        maxWidth: 200,
        sorter: "string",
        formatter: (cell: any) => {
          const row = cell.getData() as PlanogramShelfRow;
          return `<span class="text-sm font-medium text-foreground">${row.complianceRuleSet ?? "Default Rules"}</span>`;
        },
      },
      {
        title: "Shelves",
        field: "productsCount",
        minWidth: 100,
        sorter: "number",
        formatter: (cell: any) => {
          const row = cell.getData() as PlanogramShelfRow;
          return `<span class="text-sm tabular-nums font-medium text-foreground">${row.productsCount ?? 0}</span>`;
        },
      },
      {
        title: "Action",
        field: "id",
        minWidth: 60,
        headerSort: false,
        frozen: true,
        hozAlign: "center",
        formatter: () => `
          <button type="button" data-action="open-menu" title="Actions" class="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open actions menu">
            ⋯
          </button>
        `,
        cellClick: (event: any, cell: any) => {
          event.stopPropagation?.();
          const target = event.target as HTMLElement;
          const trigger = target?.closest?.("[data-action='open-menu']");
          if (!trigger) return;
          handleOpenFixtureActions(cell.getData() as PlanogramShelfRow, trigger as HTMLElement);
        },
      },
    ],
    [handleOpenFixtureActions],
  );

  return (
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
        onPaginationChange={onPaginationChange}
        onRowClick={onRowClick}
      />
    </div>
  );
}
