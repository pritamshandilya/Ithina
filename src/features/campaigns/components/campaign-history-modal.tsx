import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  GitBranch,
  Layers,
  Monitor,
  Pencil,
  Play,
  Send,
  ShieldCheck,
  Timer,
  Truck,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { CampaignListItem } from "@/types/campaigns";

interface HistoryEvent {
  id: string;
  type:
    | "created"
    | "edited"
    | "submitted"
    | "approved"
    | "scheduled"
    | "deployed"
    | "paused"
    | "resumed"
    | "completed"
    | "rejected";
  label: string;
  description: string;
  actor: string;
  timestamp: string;
  meta?: Record<string, string>;
}

function generateHistory(campaign: CampaignListItem): HistoryEvent[] {
  const base = new Date(campaign.date || Date.now());

  const offset = (days: number, hours = 0): string => {
    const d = new Date(base);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const events: HistoryEvent[] = [
    {
      id: "ev_1",
      type: "created",
      label: "Campaign Created",
      description: `Campaign "${campaign.name}" was created and saved as a draft.`,
      actor: campaign.initiator || "System",
      timestamp: offset(7, 4),
      meta: { Hardware: campaign.hardware.join(", "), SKUs: String(campaign.skus) },
    },
    {
      id: "ev_2",
      type: "edited",
      label: "Details Updated",
      description: "Campaign details were updated — hardware selection modified.",
      actor: campaign.initiator || "System",
      timestamp: offset(6, 2),
      meta: { Changed: "Hardware, SKU count" },
    },
    {
      id: "ev_3",
      type: "submitted",
      label: "Submitted for Approval",
      description: "Campaign submitted to the approval queue for review.",
      actor: campaign.initiator || "System",
      timestamp: offset(5, 1),
    },
    {
      id: "ev_4",
      type: "approved",
      label: "Approved",
      description: "Campaign reviewed and approved by the checker team.",
      actor: "Sarah J.",
      timestamp: offset(4, 3),
      meta: { Notes: "Looks good, approved for scheduling." },
    },
    {
      id: "ev_5",
      type: "scheduled",
      label: "Scheduled",
      description: `Campaign scheduled for deployment on ${campaign.date}.`,
      actor: "Auto-Scheduler",
      timestamp: offset(3),
      meta: { Deployment: campaign.date, Stores: "Store #7432" },
    },
  ];

  const status = campaign.status?.toLowerCase();
  if (status === "active") {
    events.push({
      id: "ev_6",
      type: "deployed",
      label: "Deployed to ESL",
      description: "Campaign content successfully pushed to all assigned ESL devices.",
      actor: "Auto-Scheduler",
      timestamp: offset(1),
      meta: { Devices: `${campaign.skus} ESL units`, Status: "Live" },
    });
  }
  if (status === "completed") {
    events.push(
      {
        id: "ev_6",
        type: "deployed",
        label: "Deployed to ESL",
        description: "Campaign content pushed to all assigned ESL devices.",
        actor: "Auto-Scheduler",
        timestamp: offset(2),
        meta: { Devices: `${campaign.skus} ESL units` },
      },
      {
        id: "ev_7",
        type: "completed",
        label: "Campaign Completed",
        description: "Campaign concluded at end of scheduled window. Devices reverted to default.",
        actor: "System",
        timestamp: offset(0, 2),
      },
    );
  }
  if (status === "rejected") {
    events.push({
      id: "ev_6",
      type: "rejected",
      label: "Rejected",
      description: "Campaign was rejected during review. Returned to maker for revisions.",
      actor: "Marcus T.",
      timestamp: offset(4),
      meta: { Reason: "Header colour does not meet brand guidelines." },
    });
  }

  return events.reverse();
}

const EVENT_CONFIG: Record<
  HistoryEvent["type"],
  { icon: typeof Clock; color: string; dot: string }
> = {
  created:   { icon: GitBranch,   color: "text-slate-400",   dot: "bg-slate-500" },
  edited:    { icon: Pencil,      color: "text-sky-400",     dot: "bg-sky-500" },
  submitted: { icon: Send,        color: "text-amber-400",   dot: "bg-amber-400" },
  approved:  { icon: ShieldCheck, color: "text-emerald-400", dot: "bg-emerald-400" },
  scheduled: { icon: Timer,       color: "text-indigo-400",  dot: "bg-indigo-400" },
  deployed:  { icon: Truck,       color: "text-ithina-purple", dot: "bg-ithina-purple" },
  paused:    { icon: Clock,       color: "text-amber-400",   dot: "bg-amber-500" },
  resumed:   { icon: Play,        color: "text-emerald-400", dot: "bg-emerald-400" },
  completed: { icon: CheckCircle2,color: "text-emerald-400", dot: "bg-emerald-500" },
  rejected:  { icon: X,           color: "text-rose-400",    dot: "bg-rose-500" },
};

const STATUS_PILL: Record<string, string> = {
  active:    "bg-emerald-400/15 text-emerald-400 border-emerald-400/30",
  completed: "bg-sky-400/15 text-sky-400 border-sky-400/30",
  draft:     "bg-slate-400/15 text-slate-300 border-slate-500/30",
  scheduled: "bg-amber-400/15 text-amber-400 border-amber-400/30",
  pending:   "bg-violet-400/15 text-violet-400 border-violet-400/30",
  rejected:  "bg-rose-400/15 text-rose-400 border-rose-400/30",
};

interface Props {
  campaign: CampaignListItem;
  onClose: () => void;
}

export default function CampaignHistoryModal({ campaign, onClose }: Props) {
  const events = useMemo(() => generateHistory(campaign), [campaign]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusKey = campaign.status.toLowerCase();
  const pillClass = STATUS_PILL[statusKey] ?? STATUS_PILL["draft"];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`History for ${campaign.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex h-[82vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-2xl mx-4">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-start justify-between border-b border-ithina-border/60 bg-ithina-bg/60 px-6 py-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ithina-purple/15">
                <Clock className="size-3.5 text-ithina-purple" strokeWidth={2} aria-hidden />
              </div>
              <p className="text-sm font-bold text-white">Campaign History</p>
            </div>
            <p className="truncate pl-9 text-xs font-medium text-slate-300">{campaign.name}</p>
            <div className="flex items-center gap-2 pl-9">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                  pillClass,
                )}
              >
                {campaign.status}
              </span>
              <span className="text-[10px] text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Monitor className="size-3" aria-hidden />
                {campaign.hardware.join(", ")}
              </span>
              <span className="text-[10px] text-slate-600">·</span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Layers className="size-3" aria-hidden />
                {campaign.skus} SKUs
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex size-7 shrink-0 items-center justify-center rounded-lg border border-ithina-border text-slate-500 transition-colors hover:border-slate-500 hover:text-white"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── Summary bar ─────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-6 border-b border-ithina-border/40 bg-ithina-bg/30 px-6 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Initiator</p>
            <div className="flex items-center gap-1.5">
              <User className="size-3 text-slate-500" strokeWidth={1.5} aria-hidden />
              <p className="text-[11px] font-medium text-slate-300">{campaign.initiator || "Unknown"}</p>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Created</p>
            <p className="text-[11px] font-medium text-slate-300">{campaign.date}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-600">Events</p>
            <p className="text-[11px] font-medium text-slate-300">{events.length}</p>
          </div>
        </div>

        {/* ── Timeline ────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="relative flex flex-col gap-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-ithina-border/50" aria-hidden />

            {events.map((ev, idx) => {
              const cfg = EVENT_CONFIG[ev.type];
              const Icon = cfg.icon;
              const isExpanded = expandedId === ev.id;
              const isLatest = idx === 0;

              return (
                <div key={ev.id} className="relative flex gap-4 pb-5 last:pb-0">
                  {/* Dot */}
                  <div className="relative z-10 mt-0.5 flex shrink-0 flex-col items-center">
                    <div
                      className={cn(
                        "flex size-[22px] items-center justify-center rounded-full border-2 border-ithina-sidebar",
                        cfg.dot,
                        isLatest && "ring-2 ring-offset-1 ring-offset-ithina-sidebar",
                        isLatest ? `ring-${cfg.dot.replace("bg-", "")}` : "",
                      )}
                    >
                      {isLatest ? (
                        <Circle className="size-2 fill-white text-white" aria-hidden />
                      ) : (
                        <Icon className="size-3 text-white" strokeWidth={2.5} aria-hidden />
                      )}
                    </div>
                  </div>

                  {/* Content card */}
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-all",
                        isExpanded
                          ? "border-ithina-border bg-ithina-panel/80"
                          : "border-ithina-border/50 bg-ithina-panel/40 hover:border-ithina-border hover:bg-ithina-panel/70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("size-3.5 shrink-0", cfg.color)} strokeWidth={2} aria-hidden />
                            <p className={cn("text-xs font-semibold", isLatest ? "text-white" : "text-slate-300")}>
                              {ev.label}
                            </p>
                            {isLatest && (
                              <span className="rounded-full bg-ithina-purple/20 px-1.5 py-0.5 text-[9px] font-bold text-ithina-purple">
                                Latest
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">{ev.description}</p>
                        </div>
                        <ChevronDown
                          className={cn(
                            "size-3.5 shrink-0 text-slate-600 transition-transform",
                            isExpanded && "rotate-180",
                          )}
                          strokeWidth={2}
                          aria-hidden
                        />
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t border-ithina-border/40 pt-3">
                          <div className="flex items-center gap-1.5">
                            <User className="size-3 shrink-0 text-slate-600" strokeWidth={1.5} aria-hidden />
                            <p className="text-[10px] text-slate-500">
                              By <span className="font-medium text-slate-300">{ev.actor}</span>
                            </p>
                          </div>
                          {ev.meta &&
                            Object.entries(ev.meta).map(([k, v]) => (
                              <div key={k} className="flex items-start gap-1.5">
                                <span className="mt-px font-mono text-[9px] uppercase tracking-wide text-slate-600">
                                  {k}:
                                </span>
                                <span className="text-[10px] text-slate-400">{v}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </button>

                    {/* Timestamp */}
                    <p className="mt-1 pl-1 text-[9px] font-mono text-slate-700">{ev.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-end border-t border-ithina-border/40 bg-ithina-bg/40 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-ithina-border px-4 py-1.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
