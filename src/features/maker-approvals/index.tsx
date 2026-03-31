import { CheckCircle, Clock, Send, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type SubmissionStatus = "draft" | "pending" | "approved" | "returned";

interface CampaignSubmission {
  id: string;
  name: string;
  store: string;
  createdAt: string;
  status: SubmissionStatus;
  checkerNote?: string;
}

const MOCK_SUBMISSIONS: CampaignSubmission[] = [
  {
    id: "sub-001",
    name: "Winter Clearance — Beverages",
    store: "CBD Flagship",
    createdAt: "2026-03-28",
    status: "pending",
  },
  {
    id: "sub-002",
    name: "Easter Weekend Promo",
    store: "Northgate Store",
    createdAt: "2026-03-25",
    status: "returned",
    checkerNote: "Price field missing for SKU #4432.",
  },
  {
    id: "sub-003",
    name: "Q1 Snacks Campaign",
    store: "CBD Flagship",
    createdAt: "2026-03-10",
    status: "approved",
  },
  {
    id: "sub-004",
    name: "New Season Dairy Bundle",
    store: "Westgate Branch",
    createdAt: "2026-03-30",
    status: "draft",
  },
];

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; icon: typeof Clock; colorClass: string }
> = {
  draft: {
    label: "Draft",
    icon: Clock,
    colorClass: "text-slate-400 bg-white/5 border-white/10",
  },
  pending: {
    label: "Pending Review",
    icon: Clock,
    colorClass: "text-ithina-amber bg-ithina-amber/10 border-ithina-amber/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    colorClass: "text-ithina-emerald bg-ithina-emerald/10 border-ithina-emerald/20",
  },
  returned: {
    label: "Returned",
    icon: TriangleAlert,
    colorClass: "text-ithina-rose bg-ithina-rose/10 border-ithina-rose/20",
  },
};

export default function MakerApprovalsPage() {
  const [submissions] = useState<CampaignSubmission[]>(MOCK_SUBMISSIONS);

  const counts = {
    draft: submissions.filter((s) => s.status === "draft").length,
    pending: submissions.filter((s) => s.status === "pending").length,
    returned: submissions.filter((s) => s.status === "returned").length,
    approved: submissions.filter((s) => s.status === "approved").length,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-6 pb-10">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-purple/25 bg-ithina-purple/10">
              <Send className="size-4 text-ithina-purple" aria-hidden />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Submit for Approval</h1>
              <p className="text-xs text-slate-500">
                Track and manage your campaign submissions.
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                { key: "draft", label: "Drafts", color: "text-slate-300" },
                { key: "pending", label: "Pending", color: "text-ithina-amber" },
                { key: "returned", label: "Returned", color: "text-ithina-rose" },
                { key: "approved", label: "Approved", color: "text-ithina-emerald" },
              ] as const
            ).map(({ key, label, color }) => (
              <div
                key={key}
                className="rounded-xl border border-ithina-border bg-ithina-panel p-4 text-center"
              >
                <p className={cn("text-2xl font-bold tabular-nums", color)}>
                  {counts[key]}
                </p>
                <p className="mt-1 text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Submissions list */}
          <div className="overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel">
            <div className="flex items-center justify-between border-b border-ithina-border/40 px-6 py-4">
              <p className="text-sm font-semibold text-white">My Submissions</p>
              <span className="font-mono text-[10px] uppercase tracking-widest text-slate-600">
                {submissions.length} total
              </span>
            </div>

            <div className="divide-y divide-ithina-border/40">
              {submissions.map((sub) => {
                const cfg = STATUS_CONFIG[sub.status];
                const StatusIcon = cfg.icon;

                return (
                  <div
                    key={sub.id}
                    className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-white/[0.018]"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-ithina-border bg-ithina-bg/60">
                      <StatusIcon className={cn("size-3.5", cfg.colorClass.split(" ")[0])} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {sub.name}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest",
                            cfg.colorClass,
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {sub.store} · {sub.createdAt}
                      </p>
                      {sub.checkerNote && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-ithina-rose/20 bg-ithina-rose/5 px-3 py-2">
                          <TriangleAlert className="mt-px size-3 shrink-0 text-ithina-rose" />
                          <p className="text-xs text-ithina-rose">{sub.checkerNote}</p>
                        </div>
                      )}
                    </div>

                    {sub.status === "draft" && (
                      <button
                        type="button"
                        className="shrink-0 rounded-lg border border-ithina-purple/30 bg-ithina-purple/10 px-3 py-1.5 text-xs font-semibold text-ithina-purple transition-colors hover:bg-ithina-purple/20"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
