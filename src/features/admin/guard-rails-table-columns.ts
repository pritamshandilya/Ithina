import type { DataTableCell, DataTableColumn } from "@/components/ui/data-table";
import type { GuardRailCategory, GuardRailRule, GuardRailSeverity } from "@/mocks/guard-rails";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function categoryPillClass(category: GuardRailCategory) {
  switch (category) {
    case "Pricing":
      return "border-blue-400/35 text-blue-300 bg-blue-400/10";
    case "Brand":
      return "border-ithina-purple/40 text-ithina-purple bg-ithina-purple/10";
    case "Regulatory":
      return "border-teal-400/35 text-teal-300 bg-teal-400/10";
    case "Content":
      return "border-slate-400/35 text-slate-300 bg-white/[0.04]";
  }
}

function severityPill(severity: GuardRailSeverity) {
  if (severity === "Hard") {
    return `<span class="inline-flex items-center justify-center rounded-md px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wide text-white bg-rose-950/90 border border-rose-800/60 shadow-inner">Hard</span>`;
  }
  return `<span class="inline-flex items-center justify-center rounded-md px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wide text-white bg-amber-900/85 border border-amber-700/50 shadow-inner">Soft</span>`;
}

function statusToggle(row: GuardRailRule) {
  if (row.active) {
    return `<button type="button" data-action="toggle" class="group inline-flex items-center gap-2.5 rounded-lg py-0.5 text-left transition-opacity hover:opacity-90" aria-pressed="true">
      <span class="relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border border-emerald-500/50 bg-emerald-500/20 p-0.5">
        <span class="ml-auto size-[18px] rounded-full bg-emerald-400 shadow-sm ring-1 ring-emerald-300/40"></span>
      </span>
      <span class="text-xs font-semibold text-emerald-400">Active</span>
    </button>`;
  }
  return `<button type="button" data-action="toggle" class="group inline-flex items-center gap-2.5 rounded-lg py-0.5 text-left transition-opacity hover:opacity-90" aria-pressed="false">
    <span class="relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border border-slate-600 bg-slate-800/80 p-0.5">
      <span class="size-[18px] rounded-full bg-slate-500 shadow-sm ring-1 ring-black/20"></span>
    </span>
    <span class="text-xs font-semibold text-slate-500">Off</span>
  </button>`;
}

/** Read-only: same visual weight as the toggle, non-interactive. */
function statusReadOnly(row: GuardRailRule) {
  if (row.active) {
    return `<div class="inline-flex items-center gap-2.5 py-0.5" role="status" aria-label="Active">
      <span class="relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border border-emerald-500/50 bg-emerald-500/20 p-0.5 opacity-90">
        <span class="ml-auto size-[18px] rounded-full bg-emerald-400 shadow-sm ring-1 ring-emerald-300/40"></span>
      </span>
      <span class="text-xs font-semibold text-emerald-400">Active</span>
    </div>`;
  }
  return `<div class="inline-flex items-center gap-2.5 py-0.5" role="status" aria-label="Off">
    <span class="relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full border border-slate-600 bg-slate-800/80 p-0.5 opacity-90">
      <span class="size-[18px] rounded-full bg-slate-500 shadow-sm ring-1 ring-black/20"></span>
    </span>
    <span class="text-xs font-semibold text-slate-500">Off</span>
  </div>`;
}

function pencilIcon() {
  return `<svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>`;
}

function trashIcon() {
  return `<svg class="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>`;
}

export interface BuildGuardRailColumnsParams {
  onAction: (e: MouseEvent, row: GuardRailRule) => void;
  readOnly?: boolean;
}

export function buildGuardRailTabulatorColumns({
  onAction,
  readOnly = false,
}: BuildGuardRailColumnsParams): DataTableColumn<GuardRailRule>[] {
  const columns: DataTableColumn<GuardRailRule>[] = [
    {
      title: "Rule Name",
      field: "name",
      headerSort: false,
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const d = rowData as GuardRailRule;
        return d.name.toLowerCase().includes(term) || d.id.toLowerCase().includes(term);
      },
      hozAlign: "left",
      width: 260,
      minWidth: 220,
      formatter: (cell: DataTableCell<GuardRailRule>) => {
        const row = cell.getData();
        const dot = row.active ? "bg-emerald-400" : "bg-slate-600";
        const name = escapeHtml(row.name);
        const idEsc = escapeHtml(row.id);
        return `<div class="flex items-start gap-2.5 py-1">
          <span class="mt-1.5 inline-block size-1.5 shrink-0 rounded-full ${dot}" aria-hidden="true"></span>
          <div class="min-w-0">
            <p class="text-sm font-semibold leading-tight text-white">${name}</p>
            <p class="mt-0.5 font-mono text-[10px] text-slate-600">${idEsc}</p>
          </div>
        </div>`;
      },
    },
    {
      title: "Category",
      field: "category",
      headerSort: false,
      headerFilter: "list" as const,
      headerFilterParams: {
        values: {
          "": "All",
          Pricing: "Pricing",
          Brand: "Brand",
          Regulatory: "Regulatory",
          Content: "Content",
        },
      },
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const v = value as string;
        if (!v) return true;
        return (rowData as GuardRailRule).category === v;
      },
      hozAlign: "left",
      width: 132,
      minWidth: 120,
      formatter: (cell: DataTableCell<GuardRailRule>) => {
        const row = cell.getData();
        const cat = escapeHtml(row.category);
        return `<span class="inline-flex rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold ${categoryPillClass(row.category)}">${cat}</span>`;
      },
    },
    {
      title: "Severity",
      field: "severity",
      headerSort: false,
      headerFilter: "list" as const,
      headerFilterParams: {
        values: { "": "All", Hard: "Hard", Soft: "Soft" },
      },
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const v = value as string;
        if (!v) return true;
        return (rowData as GuardRailRule).severity === v;
      },
      hozAlign: "left",
      width: 96,
      minWidth: 88,
      formatter: (cell: DataTableCell<GuardRailRule>) => {
        const row = cell.getData();
        return severityPill(row.severity);
      },
    },
    {
      title: "Description",
      field: "description",
      headerSort: false,
      headerFilter: "input" as const,
      hozAlign: "left",
      minWidth: 200,
      widthGrow: 1,
      formatter: (cell: DataTableCell<GuardRailRule>) => {
        const row = cell.getData();
        const desc = escapeHtml(row.description);
        return `<p class="min-w-0 py-0.5 text-sm leading-relaxed text-slate-200">${desc}</p>`;
      },
    },
    {
      title: "Status",
      field: "active",
      headerSort: false,
      headerFilter: "list" as const,
      headerFilterParams: {
        values: { "": "All", true: "Active", false: "Off" },
      },
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const v = value as string | boolean | undefined;
        if (v === "" || v === undefined || v === null) return true;
        const row = rowData as GuardRailRule;
        if (v === true || v === "true") return row.active === true;
        if (v === false || v === "false") return row.active === false;
        return true;
      },
      hozAlign: "left",
      width: 148,
      minWidth: 138,
      formatter: (cell: DataTableCell<GuardRailRule>) => {
        const row = cell.getData();
        return readOnly ? statusReadOnly(row) : statusToggle(row);
      },
      ...(readOnly
        ? {}
        : {
            cellClick: (e: MouseEvent, cell: DataTableCell<GuardRailRule>) => {
              onAction(e, cell.getData());
            },
          }),
    },
    {
      title: "Actions",
      field: "_actions",
      headerSort: false,
      headerFilter: false,
      headerHozAlign: "right",
      hozAlign: "right",
      width: 100,
      minWidth: 96,
      formatter: () =>
        `<div class="flex items-center justify-end gap-1.5">
          <button type="button" data-action="edit" class="inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-slate-400 transition-all hover:border-ithina-purple/40 hover:bg-white/[0.06] hover:text-white" aria-label="Edit rule">${pencilIcon()}</button>
          <button type="button" data-action="delete" class="inline-flex size-8 items-center justify-center rounded-md border border-rose-400/25 bg-transparent text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white" aria-label="Delete rule">${trashIcon()}</button>
        </div>`,
      cellClick: (e: MouseEvent, cell: DataTableCell<GuardRailRule>) => {
        onAction(e, cell.getData());
      },
    },
  ];

  if (readOnly) {
    return columns.filter((c) => c.field !== "_actions");
  }
  return columns;
}
