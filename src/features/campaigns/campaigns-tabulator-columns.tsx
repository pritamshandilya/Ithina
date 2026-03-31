/**
 * Campaign table column definitions — IthTable (native HTML table).
 * Design: Ithina Design System §2.4 + image reference.
 */

import { Check, ChevronRight, CirclePause, History, Pencil, PlayCircle, Trash2 } from "lucide-react";

import type { IthColumnDef } from "@/components/ui/ith-table";
import type { CampaignListItem, CampaignListStatus } from "@/types/campaigns";

export type CampaignProtoStatus =
  | "active"
  | "scheduled"
  | "draft"
  | "completed"
  | "pending";

export function toPrototypeStatus(status: CampaignListStatus): CampaignProtoStatus {
  switch (status) {
    case "Active":    return "active";
    case "Scheduled": return "scheduled";
    case "Completed": return "completed";
    case "Draft":     return "draft";
    case "Rejected":  return "pending";
  }
}

const STATUS_PILL: Record<CampaignProtoStatus, string> = {
  active:    "text-ithina-purple  border-ithina-purple/30  bg-ithina-purple/10",
  scheduled: "text-amber-400     border-amber-400/30      bg-amber-400/10",
  completed: "text-emerald-400   border-emerald-400/30    bg-emerald-400/10",
  draft:     "text-slate-400     border-slate-600/60      bg-white/5",
  pending:   "text-orange-400    border-orange-400/30     bg-orange-400/10",
};

const STATUS_LABEL: Record<CampaignProtoStatus, string> = {
  active:    "Active",
  scheduled: "Scheduled",
  completed: "Completed",
  draft:     "Draft",
  pending:   "Pending",
};

const PIPELINE_STAGE_CLASS: Record<string, string> = {
  Deployed:    "text-emerald-400 font-semibold",
  Scheduled:   "text-amber-400  font-semibold",
  Approval:    "text-orange-400  font-semibold",
  "Guard Rails": "text-ithina-purple font-semibold",
  Design:      "text-blue-400   font-semibold",
  Data:        "text-slate-400  font-semibold",
};

export function derivePipeline(status: CampaignListStatus): string[] {
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

function PipelineStages({ pipeline }: { pipeline: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {pipeline.map((stage, i) => {
        const isLast = i === pipeline.length - 1;
        return (
          <span key={stage} className="flex items-center gap-1">
            <span
              className={`font-mono text-[9px] whitespace-nowrap ${
                isLast
                  ? (PIPELINE_STAGE_CLASS[stage] ?? "text-slate-400 font-semibold")
                  : "text-slate-600 line-through"
              }`}
            >
              {stage}
            </span>
            {!isLast && <ChevronRight className="size-2.5 shrink-0 text-slate-700" strokeWidth={2} aria-hidden />}
          </span>
        );
      })}
    </div>
  );
}

function HardwarePills({ hardware }: { hardware: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {hardware.map((hw) => {
        const cls = hw.startsWith("ESL")
          ? "bg-blue-400/10 border-blue-400/20 text-blue-300"
          : "bg-amber-400/10 border-amber-400/20 text-amber-300";
        return (
          <span
            key={hw}
            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium ${cls}`}
          >
            {hw}
          </span>
        );
      })}
    </div>
  );
}

function EditBtn() {
  return (
    <button
      type="button"
      data-action="edit"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[10px] font-semibold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
    >
      <Pencil className="size-3" strokeWidth={2} aria-hidden />
      Edit
    </button>
  );
}

function PauseBtn({ paused }: { paused: boolean }) {
  return (
    <button
      type="button"
      data-action="pause"
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all ${
        paused
          ? "border-amber-400/30 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
          : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {paused ? <PlayCircle className="size-3" strokeWidth={2} aria-hidden /> : <CirclePause className="size-3" strokeWidth={2} aria-hidden />}
      {paused ? "Resume" : "Pause"}
    </button>
  );
}

function HistoryBtn() {
  return (
    <button
      type="button"
      data-action="history"
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
    >
      <History className="size-3" strokeWidth={2} aria-hidden />
      History
    </button>
  );
}

function DeleteBtn() {
  return (
    <button
      type="button"
      data-action="delete"
      aria-label="Delete campaign"
      className="inline-flex items-center justify-center rounded-lg border border-rose-400/20 px-2 py-1.5 text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white"
    >
      <Trash2 className="size-3" strokeWidth={2} aria-hidden />
    </button>
  );
}

export interface BuildCampaignColumnsParams {
  selectedIds: Set<string>;
  pausedById: Record<string, boolean>;
  allSelected: boolean;
  anySelected: boolean;
  onToggleAll: (checked: boolean) => void;
}

export function buildCampaignColumns({
  selectedIds,
  pausedById,
}: BuildCampaignColumnsParams): IthColumnDef<CampaignListItem>[] {
  return [
    {
      key: "select",
      label: "",
      width: "w-[44px]",
      render: (row) => (
        <button
          type="button"
          data-proto-row-select="true"
          aria-label={`Select campaign ${row.name}`}
          className={`inline-flex size-4 items-center justify-center rounded border transition-colors ${
            selectedIds.has(row.id)
              ? "border-ithina-purple bg-ithina-purple text-white"
              : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
          }`}
        >
          <Check className="size-2.5" strokeWidth={3} aria-hidden />
        </button>
      ),
    },
    {
      key: "name",
      label: "Campaign",
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-[13px] font-semibold leading-tight text-white">{row.name}</p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">{row.id}</p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: "w-[120px]",
      render: (row) => {
        const proto = toPrototypeStatus(row.status);
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] font-semibold ${STATUS_PILL[proto]}`}>
            {proto === "active" && (
              <span className="inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-current" />
            )}
            {STATUS_LABEL[proto]}
          </span>
        );
      },
    },
    {
      key: "pipeline",
      label: "Pipeline Stage",
      render: (row) => {
        const pipeline = row.pipeline ?? derivePipeline(row.status);
        return <PipelineStages pipeline={pipeline} />;
      },
    },
    {
      key: "hardware",
      label: "Hardware",
      width: "w-[170px]",
      render: (row) => <HardwarePills hardware={row.hardware} />,
    },
    {
      key: "skus",
      label: "SKUs",
      width: "w-[72px]",
      align: "left",
      render: (row) => (
        <span className="font-mono text-sm tabular-nums text-slate-400">{row.skus}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      width: "w-[120px]",
      render: (row) => (
        <span className="whitespace-nowrap font-mono text-xs text-slate-500">{row.date}</span>
      ),
    },
    {
      key: "initiator",
      label: "Initiator",
      width: "w-[140px]",
      render: (row) => <span className="text-xs text-slate-400">{row.initiator}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      width: "w-[240px]",
      render: (row) => {
        const proto = toPrototypeStatus(row.status);
        const paused = pausedById[row.id] ?? row.paused ?? false;
        return (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {proto === "draft" && <EditBtn />}
            {proto === "scheduled" && <PauseBtn paused={paused} />}
            <HistoryBtn />
            <DeleteBtn />
          </div>
        );
      },
    },
  ];
}
