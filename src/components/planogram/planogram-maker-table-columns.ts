import type { DataTableColumn } from "@/components/ui/data-table";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import type { PlanogramShelfRow } from "@/types/maker";
import { formatPlanogramShelfDimensionDisplay } from "@/lib/planogram/format-planogram-shelf-dimensions";

import {
  renderCategorizeSelectCell,
  renderComplianceSelectCell,
} from "./planogram-table-columns";

export interface CreateMakerPlanogramTableColumnsOptions {
  onOpenMenu: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
  ruleSets: ComplianceRuleSetSummary[];
}

/**
 * Maker planogram audits table: same column shape as checker fixtures list (shelf rows),
 * without checker-only flows. Associate planogram is not offered in the maker actions menu.
 */
export function createMakerPlanogramTableColumns({
  onOpenMenu,
  ruleSets,
}: CreateMakerPlanogramTableColumnsOptions): DataTableColumn<PlanogramShelfRow>[] {
  return [
    {
      title: "Fixture",
      field: "fixtureType",
      minWidth: 190,
      width: 210,
      widthGrow: 1,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const fixtureType = row.fixtureType?.replace(/_/g, " ") ?? "—";
        return `<span class="text-sm font-medium text-foreground">${fixtureType}</span>`;
      },
    },
    {
      title: "Code",
      field: "shelfCode",
      minWidth: 140,
      width: 155,
      sorter: "string",
    },
    {
      title: "Section",
      field: "section",
      minWidth: 130,
      width: 140,
      sorter: "string",
    },
    {
      title: "Aisle",
      field: "aisleCode",
      width: 96,
      sorter: "string",
    },
    {
      title: "Zone",
      field: "zone",
      minWidth: 130,
      width: 140,
      sorter: "string",
    },
    {
      title: "Dimension",
      field: "dimensions",
      minWidth: 160,
      width: 190,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const text = formatPlanogramShelfDimensionDisplay(row);
        return `<span class="text-sm tabular-nums font-medium text-foreground">${text}</span>`;
      },
    },
    {
      title: "Compliance",
      field: "complianceRuleSet",
      minWidth: 170,
      width: 180,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return renderComplianceSelectCell(row, ruleSets);
      },
    },
    {
      title: "Categorize By",
      field: "categorizeBy",
      minWidth: 130,
      width: 145,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return renderCategorizeSelectCell(row);
      },
    },
    {
      title: "Products",
      field: "productsCount",
      width: 92,
      sorter: "number",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm tabular-nums font-medium text-foreground">${row.productsCount ?? 0}</span>`;
      },
    },
    {
      title: "Action",
      field: "id",
      width: 78,
      headerSort: false,
      hozAlign: "center",
      formatter: () => `
          <button type="button" data-action="open-menu" title="Actions" class="rounded-md px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Open actions menu">
            ⋯
          </button>
        `,
      cellClick: (event: unknown, cell: { getData: () => PlanogramShelfRow }) => {
        (event as { stopPropagation?: () => void }).stopPropagation?.();
        const target = (event as { target?: HTMLElement }).target as HTMLElement;
        const trigger = target?.closest?.("[data-action='open-menu']");
        if (!trigger) return;
        onOpenMenu(cell.getData(), trigger as HTMLElement);
      },
    },
  ];
}
