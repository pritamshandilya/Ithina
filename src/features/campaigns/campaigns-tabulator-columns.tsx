/**
 * Campaign table column definitions — Tabulator DataTable.
 */

import type { DataTableCell, DataTableColumn } from "@/components/ui/data-table";
import { derivePipelineForRow } from "@/services/campaigns";
import type { CampaignListItem, CampaignListStatus } from "@/types/campaigns";

export type CampaignProtoStatus =
  | "active"
  | "scheduled"
  | "draft"
  | "completed"
  | "pending"
  | "rejected";

export function toPrototypeStatus(status: CampaignListStatus): CampaignProtoStatus {
  switch (status) {
    case "Active":    return "active";
    case "Scheduled": return "scheduled";
    case "Completed": return "completed";
    case "Pending":   return "pending";
    case "Draft":     return "draft";
    case "Rejected":  return "rejected";
  }
}

const STATUS_PILL: Record<CampaignProtoStatus, string> = {
  active:    "text-purple-400  border-purple-400/30  bg-purple-400/10",
  scheduled: "text-amber-400  border-amber-400/30   bg-amber-400/10",
  completed: "text-chart-2    border-chart-2/30     bg-chart-2/10",
  draft:     "text-slate-400  border-slate-600/60   bg-white/5",
  pending:   "text-orange-400 border-orange-400/30  bg-orange-400/10",
  rejected:  "text-rose-400   border-rose-400/30    bg-rose-400/10",
};

const STATUS_LABEL: Record<CampaignProtoStatus, string> = {
  active:    "Active",
  scheduled: "Scheduled",
  completed: "Completed",
  draft:     "Draft",
  pending:   "Pending",
  rejected:  "Rejected",
};

const PIPELINE_STAGE_CLASS: Record<string, string> = {
  Deployed:      "text-chart-2 font-semibold",
  Scheduled:     "text-amber-400 font-semibold",
  Approval:      "text-orange-400 font-semibold",
  "Guard Rails": "text-purple-400 font-semibold",
  Design:        "text-blue-400 font-semibold",
  Data:          "text-slate-400 font-semibold",
};

function pipelineHtml(pipeline: string[]): string {
  return pipeline
    .map((stage, i) => {
      const isLast = i === pipeline.length - 1;
      const cls = isLast
        ? (PIPELINE_STAGE_CLASS[stage] ?? "text-slate-400 font-semibold")
        : "text-slate-600 line-through";
      const arrow =
        !isLast
          ? `<svg class="size-2.5 shrink-0 text-slate-700 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`
          : "";
      return `<span class="inline-flex items-center gap-1"><span class="font-mono text-[9px] whitespace-nowrap ${cls}">${stage}</span>${arrow}</span>`;
    })
    .join("");
}

function hardwarePillsHtml(hardware: string[]): string {
  return hardware
    .map((hw) => {
      const cls = hw.startsWith("ESL")
        ? "bg-blue-400/10 border-blue-400/20 text-blue-300"
        : "bg-amber-400/10 border-amber-400/20 text-amber-300";
      return `<span class="rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium ${cls}">${hw}</span>`;
    })
    .join("");
}

export function canDeleteCampaignByStatus(status: CampaignListStatus): boolean {
  return status === "Draft" || status === "Rejected";
}

export interface BuildCampaignColumnsParams {
  pausedById: Record<string, boolean>;
  onEdit: (row: CampaignListItem) => void;
  onPause: (row: CampaignListItem) => void;
  onHistory: (row: CampaignListItem) => void;
  onDelete: (id: string) => void;
}

export function buildCampaignColumns({
  pausedById,
  onEdit,
  onPause,
  onHistory,
  onDelete,
}: BuildCampaignColumnsParams): DataTableColumn<CampaignListItem>[] {
  return [
    {
      title: "Campaign",
      field: "name",
      minWidth: 180,
      headerHozAlign: "left",
      hozAlign: "left",
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const row = rowData as CampaignListItem;
        return (
          row.name.toLowerCase().includes(term) || row.id.toLowerCase().includes(term)
        );
      },
      formatter: (cell: DataTableCell<CampaignListItem>) => {
        const row = cell.getData();
        return `<div class="text-left">
          <p class="text-[13px] font-semibold leading-tight text-white">${row.name}</p>
        </div>`;
      },
    },
    {
      title: "Status",
      field: "status",
      width: 130,
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const row = rowData as CampaignListItem;
        const proto = toPrototypeStatus(row.status);
        const label = STATUS_LABEL[proto].toLowerCase();
        const raw = String(row.status).toLowerCase();
        return label.includes(term) || raw.includes(term);
      },
      formatter: (cell: DataTableCell<CampaignListItem>) => {
        const row = cell.getData();
        const proto = toPrototypeStatus(row.status);
        const pulse = proto === "active" ? `<span class="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-current"></span>` : "";
        return `<span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold ${STATUS_PILL[proto]}">${pulse}${STATUS_LABEL[proto]}</span>`;
      },
    },
    {
      title: "Pipeline Stage",
      field: "pipeline",
      minWidth: 200,
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const row = rowData as CampaignListItem;
        const pipeline = derivePipelineForRow(row);
        const haystack = pipeline.join(" ").toLowerCase();
        return haystack.includes(term);
      },
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: DataTableCell<CampaignListItem>) => {
        const row = cell.getData();
        const pipeline = derivePipelineForRow(row);
        return `<div class="flex flex-wrap items-center gap-1">${pipelineHtml(pipeline)}</div>`;
      },
    },
    {
      title: "Hardware",
      field: "hardware",
      width: 180,
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const row = rowData as CampaignListItem;
        const haystack = (row.hardware ?? []).join(" ").toLowerCase();
        return haystack.includes(term);
      },
      formatter: (cell: DataTableCell<CampaignListItem>) => {
        const row = cell.getData();
        return `<div class="flex flex-wrap gap-1">${hardwarePillsHtml(row.hardware)}</div>`;
      },
    },
    {
      title: "SKUs",
      field: "skus",
      width: 72,
      sorter: "number",
      headerFilter: "input" as const,
      headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
        const term = String(value ?? "").trim().toLowerCase();
        if (!term) return true;
        const n = (rowData as CampaignListItem).skus;
        return String(n ?? "").toLowerCase().includes(term);
      },
      formatter: (cell: DataTableCell<CampaignListItem>) =>
        `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
    },
    {
      title: "Date",
      field: "date",
      width: 120,
      headerFilter: "input" as const,
      formatter: (cell: DataTableCell<CampaignListItem>) =>
        `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${String(cell.getValue() ?? "")}</span>`,
    },
    {
      title: "Initiator",
      field: "initiator",
      width: 140,
      headerFilter: "input" as const,
      formatter: (cell: DataTableCell<CampaignListItem>) =>
        `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
    },
    {
      title: "Actions",
      field: "actions",
      headerSort: false,
      headerFilter: false,
      width: 220,
      hozAlign: "right",
      headerHozAlign: "right",
      formatter: (cell: DataTableCell<CampaignListItem>) => {
        const row = cell.getData();
        const proto = toPrototypeStatus(row.status);
        const paused = pausedById[row.id] ?? row.paused ?? false;
        const canDel = canDeleteCampaignByStatus(row.status);

        const editBtn = proto === "draft"
          ? `<button data-action="edit" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[10px] font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white">
              <svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
            </button>` : "";

        const pauseBtn = proto === "scheduled"
          ? `<button data-action="pause" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all ${paused ? "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20" : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"}">
              ${paused ? `<svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>Resume` : `<svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>Pause`}
            </button>` : "";

        const historyBtn = `<button data-action="history" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
          <svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>History
        </button>`;

        const deleteBtn = canDel
          ? `<button data-action="delete" aria-label="Delete" class="inline-flex items-center justify-center rounded-lg border border-rose-400/20 px-2 py-1.5 text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white"><svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`
          : `<button data-action="delete" title="Only Draft or Rejected campaigns can be deleted." class="inline-flex items-center justify-center rounded-lg border border-slate-600/40 px-2 py-1.5 text-slate-600 opacity-60"><svg class="size-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>`;

        return `<div class="flex flex-wrap items-center justify-end gap-1.5">${editBtn}${pauseBtn}${historyBtn}${deleteBtn}</div>`;
      },
      cellClick: (_e: MouseEvent, cell: DataTableCell<CampaignListItem>) => {
        const action = (_e.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
        if (!action) return;
        const row = cell.getData();
        const a = action.dataset.action;
        if (a === "edit")    onEdit(row);
        if (a === "pause")   onPause(row);
        if (a === "history") onHistory(row);
        if (a === "delete")  onDelete(row.id);
      },
    },
  ];
}
