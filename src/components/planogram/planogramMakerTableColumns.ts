import type { DataTableColumn } from "@/components/ui/DataTable";
import { formatPlanogramShelfDimensionDisplay } from "@/lib/planogram/formatPlanogramShelfDimensions";
import type { PlanogramShelfRow } from "@/types/maker";

export interface CreateMakerPlanogramTableColumnsOptions {
  onOpenMenu: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
}

/**
 * Maker planogram audits table: same column shape as checker fixtures list (shelf rows),
 * without checker-only flows. Associate planogram is not offered in the maker actions menu.
 */
export function createMakerPlanogramTableColumns({
  onOpenMenu,
}: CreateMakerPlanogramTableColumnsOptions): DataTableColumn<PlanogramShelfRow>[] {
  return [
    {
      title: "Code",
      field: "fixtureCode",
      minWidth: 100,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="p-1">${row.fixtureCode ?? "—"}</span>`;
      },
    },
    {
      title: "Type",
      field: "fixtureType",
      minWidth: 200,
      width: 250,
      widthGrow: 1,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const fixtureType = row.fixtureType?.replace(/_/g, " ") ?? "—";
        return `<span class="text-sm font-medium text-foreground">${fixtureType}</span>`;
      },
    },
    {
      title: "Section",
      field: "section",
      minWidth: 150,
      maxWidth: 200,
      sorter: "string",
    },
    {
      title: "Aisle",
      field: "aisleCode",
      minWidth: 100,
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
      minWidth: 230,
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
      minWidth: 250,
      sorter: "string",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm font-medium text-foreground">${row.complianceRuleSet ?? "Default Rules"}</span>`;
      },
    },
    {
      title: "Shelves",
      field: "fixtureShelvesCount",
      minWidth: 100,
      sorter: "number",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm tabular-nums font-medium text-foreground">${row.fixtureShelvesCount ?? 0}</span>`;
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
      cellClick: (
        event: unknown,
        cell: { getData: () => PlanogramShelfRow },
      ) => {
        (event as { stopPropagation?: () => void }).stopPropagation?.();
        const target = (event as { target?: HTMLElement })
          .target as HTMLElement;
        const trigger = target?.closest?.("[data-action='open-menu']");
        if (!trigger) return;
        onOpenMenu(cell.getData(), trigger as HTMLElement);
      },
    },
  ];
}
