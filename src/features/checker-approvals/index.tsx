import { CheckCircle, ChevronDown, MessageSquare, TriangleAlert, X } from "lucide-react";
import { useMemo, useState } from "react";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { cn } from "@/lib/utils";

/* ─── Types ── */

type ReviewStatus = "pending" | "approved" | "returned";

interface ReviewItem {
  id: string;
  campaignName: string;
  submittedBy: string;
  store: string;
  submittedAt: string;
  status: ReviewStatus;
  items: string[];
}

/* ─── Mock data ── */

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "rev-001",
    campaignName: "Winter Clearance — Beverages",
    submittedBy: "Sarah Chen",
    store: "CBD Flagship",
    submittedAt: "2026-03-29",
    status: "pending",
    items: ["Coca-Cola 2L", "Sprite 1.5L", "Fanta Orange 500ml"],
  },
  {
    id: "rev-002",
    campaignName: "Easter Weekend Promo",
    submittedBy: "Marcus Lee",
    store: "Northgate Store",
    submittedAt: "2026-03-28",
    status: "pending",
    items: ["Cadbury Eggs 6pk", "Lindt Bunny 200g"],
  },
  {
    id: "rev-003",
    campaignName: "Q1 Snacks Campaign",
    submittedBy: "Priya Nair",
    store: "CBD Flagship",
    submittedAt: "2026-03-10",
    status: "approved",
    items: ["Lay's Classic 100g", "Doritos Nacho 200g"],
  },
  {
    id: "rev-004",
    campaignName: "Flash Sale — Electronics",
    submittedBy: "James Odhiambo",
    store: "Westgate Branch",
    submittedAt: "2026-03-27",
    status: "returned",
    items: ["USB-C Charger 45W", "Wireless Earbuds Model X"],
  },
];

const STATUS_BADGE: Record<ReviewStatus, "amber" | "emerald" | "rose"> = {
  pending:  "amber",
  approved: "emerald",
  returned: "rose",
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending:  "Pending",
  approved: "Approved",
  returned: "Returned",
};

const STATUS_HIGHLIGHT: Record<ReviewStatus, "amber" | "emerald" | "rose" | null> = {
  pending:  "amber",
  approved: "emerald",
  returned: "rose",
};

const FILTER_OPTIONS: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "all",      label: "All" },
  { key: "pending",  label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "returned", label: "Returned" },
];

/* ─── Return note modal ── */

interface ReturnNoteModalProps {
  item: ReviewItem;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

function ReturnNoteModal({ item, onConfirm, onClose }: ReturnNoteModalProps) {
  const [note, setNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-modal-title"
      >
        <header className="flex items-start justify-between border-b border-ithina-border px-7 py-5">
          <div>
            <h3 id="return-modal-title" className="text-base font-bold text-white">
              Return Campaign
            </h3>
            <p className="mt-0.5 text-sm text-slate-400">{item.campaignName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="px-7 py-6">
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Reason for returning <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what needs to be fixed or clarified..."
            rows={4}
            className="w-full resize-none rounded-lg border border-ithina-border bg-ithina-bg px-3.5 py-2.5 text-sm leading-relaxed text-white placeholder:text-slate-500 transition-colors focus:border-ithina-rose focus:outline-none"
          />
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-ithina-border px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={!note.trim()}
            className="flex items-center gap-2 rounded-lg border border-ithina-rose/30 bg-ithina-rose/10 px-5 py-2.5 text-sm font-bold text-ithina-rose transition-colors hover:bg-ithina-rose/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TriangleAlert className="size-4" />
            Return to Maker
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── Expanded detail row ── */

function ExpandedDetail({ item }: { item: ReviewItem }) {
  return (
    <div className="border-t border-ithina-border/30 bg-ithina-bg/30 px-6 py-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-600">
        Campaign Items
      </p>
      <ul className="space-y-1">
        {item.items.map((sku) => (
          <li key={sku} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="size-1.5 shrink-0 rounded-full bg-ithina-purple/50" />
            {sku}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main page ── */

export default function CheckerApprovalsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [filter, setFilter] = useState<ReviewStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [returnTarget, setReturnTarget] = useState<ReviewItem | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.status === filter)),
    [reviews, filter],
  );

  const handleApprove = (id: string) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r)));
  };

  const handleReturn = (_note: string) => {
    if (!returnTarget) return;
    setReviews((prev) =>
      prev.map((r) => (r.id === returnTarget.id ? { ...r, status: "returned" } : r)),
    );
    setReturnTarget(null);
  };

  const columns = useMemo<IthColumnDef<ReviewItem>[]>(
    () => [
      {
        key: "campaignName",
        label: "Campaign",
        sortable: true,
        render: (row) => (
          <IthPrimaryCell
            primary={row.campaignName}
            secondary={`${row.submittedBy} · ${row.store} · ${row.submittedAt}`}
          />
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "w-[120px]",
        render: (row) => (
          <IthBadge label={STATUS_LABEL[row.status]} variant={STATUS_BADGE[row.status]} />
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "w-[200px]",
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === row.id ? null : row.id); }}
              className="rounded-lg border border-ithina-border p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Expand"
            >
              <ChevronDown
                className={cn("size-3.5 transition-transform", expandedId === row.id && "rotate-180")}
              />
            </button>

            {row.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setReturnTarget(row); }}
                  className="flex items-center gap-1.5 rounded-lg border border-ithina-rose/30 bg-ithina-rose/10 px-3 py-1.5 text-xs font-semibold text-ithina-rose transition-colors hover:bg-ithina-rose/20"
                >
                  <MessageSquare className="size-3" />
                  Return
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleApprove(row.id); }}
                  className="flex items-center gap-1.5 rounded-lg border border-ithina-emerald/30 bg-ithina-emerald/10 px-3 py-1.5 text-xs font-semibold text-ithina-emerald transition-colors hover:bg-ithina-emerald/20"
                >
                  <CheckCircle className="size-3" />
                  Approve
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [expandedId],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-5xl space-y-6 pb-10">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-purple/25 bg-ithina-purple/10">
                <CheckCircle className="size-4 text-ithina-purple" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Approval Queue</h1>
                <p className="text-xs text-slate-500">
                  Review and approve or return campaign submissions from makers.
                </p>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex w-fit items-center gap-1 rounded-xl border border-ithina-border bg-ithina-bg/40 p-1">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setFilter(key); setPage(1); }}
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-semibold transition-all",
                    filter === key ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
                  )}
                >
                  {label}
                  {key !== "all" && (
                    <span className="ml-1.5 tabular-nums opacity-70">
                      ({reviews.filter((r) => r.status === key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Review table */}
            <IthTable<ReviewItem>
              data={filtered}
              columns={columns}
              rowKey={(r) => r.id}
              onRowClick={(row) => setExpandedId(expandedId === row.id ? null : row.id)}
              rowHighlight={(row) => STATUS_HIGHLIGHT[row.status]}
              pagination={{
                page,
                pageSize: 10,
                total: filtered.length,
                onPageChange: setPage,
              }}
              empty={{
                icon: <CheckCircle className="size-5 text-slate-600" />,
                message: "No submissions in this category.",
              }}
            />

            {/* Expanded detail drawer */}
            {expandedId && (() => {
              const item = reviews.find((r) => r.id === expandedId);
              return item ? <ExpandedDetail item={item} /> : null;
            })()}
          </div>
        </div>
      </div>

      {returnTarget && (
        <ReturnNoteModal
          item={returnTarget}
          onConfirm={handleReturn}
          onClose={() => setReturnTarget(null)}
        />
      )}
    </>
  );
}
