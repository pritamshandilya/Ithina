import type { PrototypeTabulatorColumn } from "@/components/ui/prototype-tabulator";
import type { CampaignListItem, CampaignListStatus } from "@/types/campaigns";

export type CampaignProtoStatus = Exclude<"all" | "active" | "scheduled" | "draft" | "completed", "all"> | "pending";

export function toPrototypeStatus(status: CampaignListStatus): CampaignProtoStatus {
  switch (status) {
    case "Active":
      return "active";
    case "Scheduled":
      return "scheduled";
    case "Completed":
      return "completed";
    case "Draft":
      return "draft";
    case "Rejected":
      return "pending";
  }
}

function statusPillClass(proto: CampaignProtoStatus) {
  switch (proto) {
    case "active":
      return "text-ithina-purple border-ithina-purple/30 bg-ithina-purple/8";
    case "scheduled":
      return "text-amber-400 border-amber-400/30 bg-amber-400/8";
    case "completed":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/8";
    case "draft":
      return "text-slate-400 border-slate-600/60 bg-white/4";
    case "pending":
      return "text-orange-400 border-orange-400/30 bg-orange-400/8";
  }
}

function pipelineStageClass(stage: string) {
  switch (stage) {
    case "Deployed":
      return "text-emerald-400 font-semibold";
    case "Scheduled":
      return "text-amber-400 font-semibold";
    case "Approval":
      return "text-orange-400 font-semibold";
    case "Guard Rails":
      return "text-ithina-purple font-semibold";
    case "Design":
      return "text-blue-400 font-semibold";
    case "Data":
      return "text-slate-400 font-semibold";
    default:
      return "text-slate-400";
  }
}

export function derivePipeline(status: CampaignListStatus) {
  switch (status) {
    case "Active":
    case "Completed":
      return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
    case "Scheduled":
      return ["Data", "Design", "Guard Rails", "Scheduled"];
    case "Draft":
      return ["Data", "Design"];
    case "Rejected":
      return ["Data", "Design", "Guard Rails", "Approval"];
  }
}

function chevronRightIcon() {
  return `<svg class="w-2.5 h-2.5 text-slate-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
  </svg>`;
}

function pencilIcon() {
  return `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>`;
}

function pauseIcon() {
  return `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`;
}

function playIcon() {
  return `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`;
}

function historyIcon() {
  return `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>`;
}

function trashIcon() {
  return `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
  </svg>`;
}

export type BuildCampaignColumnsParams = {
  selectedIds: Set<string>;
  pausedById: Record<string, boolean>;
};

export function buildCampaignTabulatorColumns({
  selectedIds,
  pausedById,
}: BuildCampaignColumnsParams): PrototypeTabulatorColumn<CampaignListItem>[] {
  return [
    {
      title: `<input type="checkbox" data-proto-header-checkbox="true" aria-label="Select all campaigns" class="accent-purple-500 cursor-pointer" />`,
      field: "id",
      headerSort: false,
      hozAlign: "center",
      width: 48,
      minWidth: 48,
      cssClass: "camp-col-check",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        const checked = selectedIds.has(r.id);
        return `<button
            type="button"
            data-proto-row-select="true"
            aria-label="Select campaign ${r.name}"
            class="inline-flex size-4 items-center justify-center rounded border transition-colors ${
              checked
                ? "border-ithina-purple bg-ithina-purple text-white"
                : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
            }"
          >
            <svg class="size-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.216a1 1 0 111.415-1.415l4.036 4.036 6.543-6.546a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
          </button>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</div>`,
      field: "name",
      headerSort: false,
      width: 220,
      minWidth: 200,
      cssClass: "camp-col-campaign",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        return `<div class="min-w-[200px]">
            <p class="text-sm font-semibold text-white leading-tight">${r.name}</p>
            <p class="text-[10px] font-mono text-slate-600 mt-0.5">${r.id}</p>
          </div>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Status</div>`,
      field: "status",
      headerSort: false,
      width: 118,
      minWidth: 118,
      cssClass: "camp-col-mid",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        const proto = toPrototypeStatus(r.status);
        const label = proto === "pending" ? "Pending" : proto.charAt(0).toUpperCase() + proto.slice(1);
        const dot =
          proto === "active"
            ? `<span class="size-1.5 animate-pulse rounded-full bg-current inline-block mr-1.5 shrink-0"></span>`
            : "";
        return `<span class="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-mono font-semibold ${statusPillClass(proto)}">${dot}${label}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Pipeline Stage</div>`,
      field: "pipeline",
      headerSort: false,
      width: 360,
      minWidth: 260,
      cssClass: "camp-col-mid camp-col-pipeline",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        const pipeline = r.pipeline ?? derivePipeline(r.status);
        return `<div class="flex flex-wrap items-center gap-1">
            ${pipeline
              .flatMap((stage, si) => [
                `<span class="text-[9px] font-mono whitespace-nowrap ${si === pipeline.length - 1 ? pipelineStageClass(stage) : "text-slate-600 line-through"}">${stage}</span>`,
                ...(si < pipeline.length - 1 ? [chevronRightIcon()] : []),
              ])
              .join("")}
          </div>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Hardware</div>`,
      field: "hardware",
      headerSort: false,
      width: 168,
      minWidth: 150,
      cssClass: "camp-col-mid",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        return `<div class="flex flex-wrap gap-1">${r.hardware
          .map((hw) => {
            const cls = hw.startsWith("ESL")
              ? "bg-blue-400/8 border-blue-400/20 text-blue-300"
              : "bg-amber-400/8 border-amber-400/20 text-amber-300";
            return `<span class="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${cls}">${hw}</span>`;
          })
          .join("")}</div>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</div>`,
      field: "skus",
      headerSort: false,
      width: 72,
      minWidth: 72,
      cssClass: "camp-col-mid",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        return `<span class="text-sm font-mono tabular-nums text-slate-400">${r.skus}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Date</div>`,
      field: "date",
      headerSort: false,
      width: 118,
      minWidth: 110,
      cssClass: "camp-col-mid",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        return `<span class="text-xs text-slate-500 font-mono whitespace-nowrap">${r.date}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Initiator</div>`,
      field: "initiator",
      headerSort: false,
      width: 150,
      minWidth: 130,
      cssClass: "camp-col-mid",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        return `<span class="text-xs text-slate-500">${r.initiator}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">Actions</div>`,
      field: "_actions",
      headerSort: false,
      headerHozAlign: "right",
      hozAlign: "right",
      minWidth: 240,
      width: 280,
      cssClass: "camp-col-actions",
      formatter: (cell) => {
        const r = cell.getData() as CampaignListItem;
        const proto = toPrototypeStatus(r.status);
        const paused = pausedById[r.id] ?? r.paused ?? false;

        const editBtn =
          proto === "draft"
            ? `<button type="button" data-action="edit" class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap">${pencilIcon()}Edit</button>`
            : "";

        const pauseBtn =
          proto === "scheduled"
            ? `<button type="button" data-action="pause" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all ${
                paused
                  ? "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20"
                  : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/10"
              }">${paused ? playIcon() : pauseIcon()}${paused ? "Resume" : "Pause"}</button>`
            : "";

        const historyBtn = `<button type="button" data-action="history" class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap">${historyIcon()}History</button>`;

        const deleteBtn = `<button type="button" data-action="delete" class="inline-flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500 px-2 py-1.5 rounded-lg border border-rose-400/20 hover:border-rose-500 transition-all" aria-label="Delete">${trashIcon()}</button>`;

        return `<div class="flex flex-wrap items-center justify-end gap-1.5">${editBtn}${pauseBtn}${historyBtn}${deleteBtn}</div>`;
      },
    },
  ];
}
