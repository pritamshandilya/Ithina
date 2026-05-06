import {
  FilePenLine,
  FileText,
  LayoutGrid,
  Plus,
  ScanLine,
  Trash2,
} from "lucide-react";
import { type Ref, forwardRef, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import type { DataTableColumn } from "@/components/ui/DataTable";
import {
  AUDIT_STATUS_LABELS,
  getAuditStatusClass,
} from "@/lib/constants/maker";
import { cn } from "@/lib/utils";
import type { ComplianceRuleSetSummary } from "@/types/complianceRuleSet";
import type { PlanogramShelfRow } from "@/types/maker";

export const CATEGORIZE_OPTIONS = ["By Category", "By Brand"] as const;

export function getDefaultComplianceRuleSetName(
  ruleSets: ComplianceRuleSetSummary[],
): string {
  return ruleSets.find((s) => s.isDefault)?.name ?? "Default Rules";
}

export function renderComplianceSelectCell(
  row: PlanogramShelfRow,
  ruleSets: ComplianceRuleSetSummary[],
): string {
  const defaultName = getDefaultComplianceRuleSetName(ruleSets);
  const selected = row.complianceRuleSet ?? defaultName;
  const sets: { name: string }[] =
    ruleSets.length > 0 ? ruleSets : [{ name: "Default Rules" }];
  const options = sets
    .map((s) => {
      const sel = s.name === selected ? " selected" : "";
      return `<option value="${s.name}"${sel}>${s.name}</option>`;
    })
    .join("");
  return `
    <select data-planogram-dropdown data-shelf-id="${row.id}" data-field="compliance"
      class="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      ${options}
    </select>
  `;
}

export function renderCategorizeSelectCell(row: PlanogramShelfRow): string {
  const selected = row.categorizeBy ?? "By Category";
  const options = CATEGORIZE_OPTIONS.map(
    (opt) =>
      `<option value="${opt}"${
        opt === selected ? " selected" : ""
      }>${opt}</option>`,
  ).join("");
  return `
    <select data-planogram-dropdown data-shelf-id="${row.id}" data-field="categorize"
      class="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
      ${options}
    </select>
  `;
}

export const PLANOGRAM_INITIAL_SORT = {
  field: "shelfName" as const,
  dir: "asc" as const,
};

export const PLANOGRAM_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export interface CreatePlanogramColumnsOptions {
  onOpenMenu: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
  ruleSets: ComplianceRuleSetSummary[];
  useShelfIdField?: "id" | "shelf_id";
  showComplianceColumns?: boolean;
}

export function createPlanogramColumns({
  onOpenMenu,
  ruleSets,
  useShelfIdField = "id",
  showComplianceColumns = true,
}: CreatePlanogramColumnsOptions): DataTableColumn<PlanogramShelfRow>[] {
  void useShelfIdField;

  return [
    {
      title: "Code",
      field: "shelfCode",
      width: 92,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const value = row.shelfCode ?? row.shelf_id ?? "—";
        return `<span class="text-sm tabular-nums font-medium text-foreground">${value}</span>`;
      },
    },
    {
      title: "Shelf Name",
      field: "shelfName",
      minWidth: 200,
      widthGrow: 2,
      width: 240,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `
        <div class="min-w-0 py-1">
          <span class="font-medium text-foreground truncate">${row.shelfName}</span>
        </div>
      `;
      },
    },
    {
      title: "Section",
      field: "section",
      minWidth: 120,
      widthGrow: 1,
      width: 136,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm font-medium text-foreground truncate block">${row.section ?? "—"}</span>`;
      },
    },
    {
      title: "Fixture Name",
      field: "fixtureType",
      minWidth: 120,
      width: 152,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const type = row.fixtureType?.replace(/_/g, " ") ?? "—";
        return `<span class="text-sm font-medium text-foreground">${type}</span>`;
      },
    },
    {
      title: "Width",
      field: "width",
      width: 76,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const value = row.width != null ? row.width : "—";
        return `<span class="text-sm tabular-nums font-medium text-foreground">${value}</span>`;
      },
    },
    {
      title: "Height",
      field: "height",
      width: 76,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const value = row.height != null ? row.height : "—";
        return `<span class="text-sm tabular-nums font-medium text-foreground">${value}</span>`;
      },
    },
    {
      title: "Depth",
      field: "depth",
      width: 76,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const value = row.depth != null ? row.depth : "—";
        return `<span class="text-sm tabular-nums font-medium text-foreground">${value}</span>`;
      },
    },
    ...(showComplianceColumns
      ? [
          {
            title: "Compliance",
            field: "complianceRuleSet",
            width: 176,
            minWidth: 160,
            sorter: "string" as const,
            headerSort: true,
            headerFilter: false,
            formatter: (cell: unknown) => {
              const row = (
                cell as { getData: () => PlanogramShelfRow }
              ).getData();
              return renderComplianceSelectCell(row, ruleSets);
            },
          },
          {
            title: "Categorize By",
            field: "categorizeBy",
            width: 140,
            minWidth: 128,
            sorter: "string" as const,
            headerSort: true,
            headerFilter: false,
            formatter: (cell: unknown) => {
              const row = (
                cell as { getData: () => PlanogramShelfRow }
              ).getData();
              return renderCategorizeSelectCell(row);
            },
          },
        ]
      : []),
    {
      title: "Products",
      field: "productsCount",
      width: 88,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const n = row.productsCount ?? 0;
        return `<span class="tabular-nums text-sm font-medium text-foreground">${n}</span>`;
      },
    },
    {
      title: "Status",
      field: "status",
      width: 152,
      minWidth: 132,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const label = AUDIT_STATUS_LABELS[row.status] ?? row.status;
        const statusClass = getAuditStatusClass(row.status);
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}">${label}</span>`;
      },
    },
    {
      title: "Action",
      field: "id",
      width: 52,
      minWidth: 48,
      headerSort: false,
      headerFilter: false,
      hozAlign: "center",
      formatter: () => `
      <button type="button" data-action="open-menu" title="Actions" class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-center" aria-label="Open actions menu">
        <svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </button>
    `,
      cellClick: (
        event: unknown,
        cell: { getData: () => PlanogramShelfRow },
      ) => {
        (event as { stopPropagation?: () => void }).stopPropagation?.();
        const target = (event as { target?: HTMLElement })
          .target as HTMLElement;
        const btn = target?.closest?.("[data-action]");
        if (!btn || btn.getAttribute("data-action") !== "open-menu") return;
        onOpenMenu(cell.getData(), btn as HTMLElement);
      },
    },
  ];
}

export interface PlanogramStatusCellProps {
  status: PlanogramShelfRow["status"];
}

export function PlanogramStatusCell({
  status,
}: PlanogramStatusCellProps): React.JSX.Element {
  const label = AUDIT_STATUS_LABELS[status] ?? status;
  const statusClass = getAuditStatusClass(status);

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass}`}
    >
      {label}
    </span>
  );
}

export type PlanogramActionsMenuVariant = "maker" | "checker";

const MENU_VIEWPORT_PAD = 8;
const MENU_GAP = 4;

function computeMenuPosition(
  trigger: HTMLElement,
  menuWidth: number,
  menuHeight: number,
  anchorPoint?: { x: number; y: number },
): { left: number; top: number } {
  const useAnchorFallback =
    !!anchorPoint &&
    (!trigger.isConnected ||
      (trigger.getBoundingClientRect().left === 0 &&
        trigger.getBoundingClientRect().top === 0));
  const rect = useAnchorFallback ? null : trigger.getBoundingClientRect();
  let left = useAnchorFallback
    ? anchorPoint!.x
    : (rect?.left ?? MENU_VIEWPORT_PAD);
  let top = useAnchorFallback
    ? anchorPoint!.y + MENU_GAP
    : (rect?.bottom ?? MENU_VIEWPORT_PAD) + MENU_GAP;
  if (left + menuWidth + MENU_VIEWPORT_PAD > window.innerWidth) {
    left = window.innerWidth - menuWidth - MENU_VIEWPORT_PAD;
  }
  left = Math.max(MENU_VIEWPORT_PAD, left);
  if (top + menuHeight + MENU_VIEWPORT_PAD > window.innerHeight) {
    top = useAnchorFallback
      ? anchorPoint!.y - menuHeight - MENU_GAP
      : (rect?.top ?? MENU_VIEWPORT_PAD) - menuHeight - MENU_GAP;
  }
  top = Math.max(MENU_VIEWPORT_PAD, top);
  return { left, top };
}

export interface PlanogramActionsMenuProps {
  row: PlanogramShelfRow;
  triggerEl: HTMLElement;
  anchorPoint?: { x: number; y: number };
  variant: PlanogramActionsMenuVariant;
  onClose: () => void;
  onView?: (row: PlanogramShelfRow) => void;
  onRunAdhoc?: (row: PlanogramShelfRow) => void;
  onRunPlanogram?: (row: PlanogramShelfRow) => void;
  onViewComplianceRule?: (row: PlanogramShelfRow) => void;
  onAssociatePlanogram?: (row: PlanogramShelfRow) => void;
  onEditShelf?: (row: PlanogramShelfRow) => void;
  onAddShelf?: (row: PlanogramShelfRow) => void;
  onDeleteShelf?: (shelfId: string) => void;
  onDeleteFixture?: (row: PlanogramShelfRow) => void;
  editLabel?: string;
  deleteLabel?: string;
}

const actionMenuButtonClass =
  "flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm text-left whitespace-normal [&_svg]:size-4 [&_svg]:shrink-0";

export const PlanogramActionsMenu = forwardRef(function PlanogramActionsMenu(
  {
    row,
    triggerEl,
    anchorPoint,
    variant,
    onClose,
    onView,
    onRunAdhoc,
    onRunPlanogram,
    onViewComplianceRule,
    onAssociatePlanogram,
    onEditShelf,
    onAddShelf,
    onDeleteShelf,
    onDeleteFixture,
    editLabel = "Edit",
    deleteLabel = "Delete",
  }: PlanogramActionsMenuProps,
  ref: Ref<HTMLDivElement>,
) {
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [placed, setPlaced] = useState(false);
  const innerRef = useRef<HTMLDivElement | null>(null);

  const setMenuRef = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useLayoutEffect(() => {
    setPlaced(false);
    const update = () => {
      const menuNode = innerRef.current;
      if (!menuNode) return;
      const mw = menuNode.offsetWidth;
      const mh = menuNode.offsetHeight;
      setPos(computeMenuPosition(triggerEl, mw, mh, anchorPoint));
      setPlaced(true);
    };

    update();
    const rafId = requestAnimationFrame(update);

    const menuNode = innerRef.current;
    const ro =
      menuNode && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => update())
        : null;
    if (menuNode) ro?.observe(menuNode);

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [triggerEl, anchorPoint, row.id, variant, row.planogramId]);

  const content = (
    <div
      ref={setMenuRef}
      data-planogram-actions-menu
      className={cn(
        "border-border bg-popover fixed z-100 w-max max-w-[min(20rem,calc(100vw-2rem))] min-w-48 overflow-hidden rounded-md border p-1 shadow-md transition-opacity duration-75",
        placed ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ left: pos.left, top: pos.top }}
    >
      {variant === "checker" && onAssociatePlanogram ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onAssociatePlanogram(row);
            onClose();
          }}
        >
          <LayoutGrid className="text-muted-foreground shrink-0" />
          <span className="min-w-0">Associate Planogram</span>
        </Button>
      ) : null}
      {onView ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onView(row);
            onClose();
          }}
        >
          <FileText className="text-muted-foreground shrink-0" />
          <span className="min-w-0">View</span>
        </Button>
      ) : null}
      {onEditShelf ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onEditShelf(row);
            onClose();
          }}
        >
          <FilePenLine className="text-muted-foreground shrink-0" />
          <span className="min-w-0">{editLabel}</span>
        </Button>
      ) : null}
      {onAddShelf ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onAddShelf(row);
            onClose();
          }}
        >
          <Plus className="text-muted-foreground shrink-0" />
          <span className="min-w-0">Add Shelf</span>
        </Button>
      ) : null}
      {onRunPlanogram ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onRunPlanogram(row);
            onClose();
          }}
        >
          <LayoutGrid className="text-muted-foreground shrink-0" />
          <span className="min-w-0">Planogram Analysis</span>
        </Button>
      ) : null}
      {onRunAdhoc ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onRunAdhoc(row);
            onClose();
          }}
        >
          <ScanLine className="text-muted-foreground shrink-0" />
          <span className="min-w-0">Adhoc Analysis</span>
        </Button>
      ) : null}
      {onViewComplianceRule ? (
        <Button
          type="button"
          variant="icon-ghost"
          className={actionMenuButtonClass}
          onClick={() => {
            onViewComplianceRule?.(row);
            onClose();
          }}
        >
          <FileText className="text-muted-foreground shrink-0" />
          <span className="min-w-0">View Compliance</span>
        </Button>
      ) : null}
      {onDeleteFixture || onDeleteShelf ? (
        <>
          <div className="bg-border -mx-1 my-1 h-px" />
          <Button
            type="button"
            variant="destructive-ghost"
            className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg]:size-4 [&_svg]:shrink-0"
            onClick={() => {
              if (onDeleteFixture) {
                onDeleteFixture(row);
              } else {
                onDeleteShelf?.(row.id);
              }
              onClose();
            }}
          >
            <Trash2 />
            {deleteLabel}
          </Button>
        </>
      ) : null}
    </div>
  );

  return createPortal(content, document.body);
});
