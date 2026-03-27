import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import { format } from "date-fns";
import type { DataTableColumn } from "@/components/ui/data-table";
import type { ComplianceRuleSetSummary } from "@/types/compliance-rule-set";
import { AUDIT_STATUS_LABELS, getAuditStatusClass } from "@/lib/constants/maker";
import type { PlanogramShelfRow } from "@/types/maker";
import { Button } from "@/components/ui/button";
import { FileText, LayoutGrid, Plus, ScanLine, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const CATEGORIZE_OPTIONS = ["By Category", "By Brand"] as const;

export const PLANOGRAM_INITIAL_SORT = {
  field: "shelfName" as const,
  dir: "asc" as const,
};

export const PLANOGRAM_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export interface CreatePlanogramColumnsOptions {
  onOpenMenu: (row: PlanogramShelfRow, triggerEl: HTMLElement) => void;
  ruleSets: ComplianceRuleSetSummary[];
  useShelfIdField?: "id" | "shelf_id";
}

export function createPlanogramColumns({
  onOpenMenu,
  ruleSets,
  useShelfIdField = "id",
}: CreatePlanogramColumnsOptions): DataTableColumn<PlanogramShelfRow>[] {
  void useShelfIdField;

  return [
    {
      title: "Code",
      field: "shelfCode",
      width: 120,
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
      minWidth: 180,
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
      title: "Aisle",
      field: "aisleCode",
      width: 70,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const val =
          row.aisleCode ??
          (row.aisleNumber != null ? `A${row.aisleNumber}` : null) ??
          "—";
        return `<span class="text-sm font-medium text-foreground tabular-nums">${val}</span>`;
      },
    },
    {
      title: "Zone",
      field: "zone",
      width: 100,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm font-medium text-foreground">${row.zone ?? "—"}</span>`;
      },
    },
    
    {
      title: "Section",
      field: "section",
      minWidth: 140,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        return `<span class="text-sm font-medium text-foreground truncate block">${row.section ?? "—"}</span>`;
      },
    },
    {
      title: "Fixture",
      field: "fixtureType",
      width: 120,
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
      width: 100,
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
      width: 100,
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
      width: 100,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const value = row.depth != null ? row.depth : "—";
        return `<span class="text-sm tabular-nums font-medium text-foreground">${value}</span>`;
      },
    },
    {
      title: "Compliance",
      field: "complianceRuleSet",
      width: 160,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const defaultName =
          ruleSets.find((s) => s.isDefault)?.name ?? "Default Rules";
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
      },
    },
    {
      title: "Categorize By",
      field: "categorizeBy",
      width: 140,
      sorter: "string",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const selected = row.categorizeBy ?? "By Category";
        const options = CATEGORIZE_OPTIONS.map(
          (opt) =>
            `<option value="${opt}"${
              opt === selected ? " selected" : ""
            }>${opt}</option>`
        ).join("");
        return `
        <select data-planogram-dropdown data-shelf-id="${row.id}" data-field="categorize"
          class="w-full min-w-0 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          ${options}
        </select>
      `;
      },
    },
    {
      title: "Last Run",
      field: "lastRun",
      width: 120,
      sorter: "date",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        if (!row.lastRun) {
          return `<span class="text-xs text-muted-foreground italic">No runs</span>`;
        }
        return `<span class="text-sm text-foreground">${format(
          new Date(row.lastRun),
          "MMM d, yyyy"
        )}</span>`;
      },
    },
    {
      title: "Products",
      field: "productsCount",
      width: 100,
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
      title: "Issues",
      field: "issuesCount",
      width: 90,
      sorter: "number",
      headerSort: true,
      headerFilter: false,
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => PlanogramShelfRow }).getData();
        const n = row.issuesCount ?? 0;
        const cls =
          n > 0 ? "text-destructive font-semibold" : "text-muted-foreground";
        return `<span class="tabular-nums text-sm ${cls}">${n}</span>`;
      },
    },
    {
      title: "Status",
      field: "status",
      width: 130,
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
      width: 56,
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
        const target = (event as { target?: HTMLElement }).target as HTMLElement;
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
): { left: number; top: number } {
  const rect = trigger.getBoundingClientRect();
  let left = rect.left;
  let top = rect.bottom + MENU_GAP;
  if (left + menuWidth + MENU_VIEWPORT_PAD > window.innerWidth) {
    left = window.innerWidth - menuWidth - MENU_VIEWPORT_PAD;
  }
  left = Math.max(MENU_VIEWPORT_PAD, left);
  if (top + menuHeight + MENU_VIEWPORT_PAD > window.innerHeight) {
    top = rect.top - menuHeight - MENU_GAP;
  }
  top = Math.max(MENU_VIEWPORT_PAD, top);
  return { left, top };
}

export interface PlanogramActionsMenuProps {
  row: PlanogramShelfRow;
  triggerEl: HTMLElement;
  variant: PlanogramActionsMenuVariant;
  onClose: () => void;
  onNewRun?: (shelfId: string) => void;
  onViewComplianceRule?: (row: PlanogramShelfRow) => void;
  onAssociatePlanogram?: (shelfId: string) => void;
  onDeleteShelf?: (shelfId: string) => void;
}

const actionMenuButtonClass =
  "flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm text-left whitespace-normal [&_svg]:size-4 [&_svg]:shrink-0";

export const PlanogramActionsMenu = forwardRef(function PlanogramActionsMenu(
  {
    row,
    triggerEl,
    variant,
    onClose,
    onNewRun,
    onViewComplianceRule,
    onAssociatePlanogram,
    onDeleteShelf,
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
      setPos(computeMenuPosition(triggerEl, mw, mh));
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
  }, [triggerEl, row.id, variant, row.planogramId]);

  const content = (
    <div
      ref={setMenuRef}
      data-planogram-actions-menu
      className={cn(
        "fixed z-100 w-max min-w-48 max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md transition-opacity duration-75",
        placed ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      style={{ left: pos.left, top: pos.top }}
    >
      {variant === "checker" && !row.planogramId ? (
        <>
          <Button
            type="button"
            variant="icon-ghost"
            className={actionMenuButtonClass}
            onClick={() => {
              onAssociatePlanogram?.(row.id);
              onClose();
            }}
          >
            <LayoutGrid className="shrink-0 text-muted-foreground" />
            <span className="min-w-0">Planogram analysis</span>
          </Button>
          <Button
            type="button"
            variant="icon-ghost"
            className={actionMenuButtonClass}
            onClick={() => {
              onNewRun?.(row.id);
              onClose();
            }}
          >
            <ScanLine className="shrink-0 text-muted-foreground" />
            <span className="min-w-0">Adhoc analysis</span>
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="icon-ghost"
            className={actionMenuButtonClass}
            onClick={() => {
              onNewRun?.(row.id);
              onClose();
            }}
          >
            <Plus className="shrink-0 text-muted-foreground" />
            <span className="min-w-0">New</span>
          </Button>
          <Button
            type="button"
            variant="icon-ghost"
            className={actionMenuButtonClass}
            onClick={() => {
              onViewComplianceRule?.(row);
              onClose();
            }}
          >
            <FileText className="shrink-0 text-muted-foreground" />
            <span className="min-w-0">View Compliance Rule</span>
          </Button>
        </>
      )}
      <div className="-mx-1 my-1 h-px bg-border" />
      <Button
        type="button"
        variant="destructive-ghost"
        className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg]:size-4 [&_svg]:shrink-0"
        onClick={() => {
          onDeleteShelf?.(row.id);
          onClose();
        }}
      >
        <Trash2 />
        Delete
      </Button>
    </div>
  );

  return createPortal(content, document.body);
});
