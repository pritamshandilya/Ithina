import { memo, useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types/approval";

interface TaskInboxProps {
  items: InboxItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

type FilterTab = "all" | "pending" | "rejected" | "urgent";

const PAGE_SIZE = 8;

function TaskInbox({ items, activeIndex, onSelect }: TaskInboxProps) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.initiator.toLowerCase().includes(q);
      const matchTab =
        tab === "all" ||
        (tab === "pending" && item.status !== "rejected") ||
        (tab === "rejected" && item.status === "rejected") ||
        (tab === "urgent" && item.urgent && item.status !== "rejected");
      return matchSearch && matchTab;
    });
  }, [items, search, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pendingCount = items.filter((i) => i.status !== "rejected").length;
  const rejectedCount = items.filter((i) => i.status === "rejected").length;
  const urgentCount = items.filter((i) => i.urgent && i.status !== "rejected").length;

  const handleTabChange = (t: FilterTab) => {
    setTab(t);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const originalIndex = (item: InboxItem) => items.findIndex((i) => i.id === item.id);

  return (
    <aside
      className="z-10 flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl"
      aria-label="Task inbox"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-white/[0.01] px-5 py-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ithina-muted">Task Inbox</h2>
        <span className="rounded border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-[9px] font-bold text-rose-400">
          {items.length} PENDING
        </span>
      </div>

      {/* Search */}
      <div className="shrink-0 border-b border-ithina-border px-3 py-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 transition-colors focus-within:border-ithina-purple/40">
          <Search className="size-3.5 shrink-0 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => handleSearch("")} className="text-slate-500 hover:text-white">
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex shrink-0 gap-1 border-b border-ithina-border px-3 py-2">
        {(
          [
            { id: "all", label: "All", count: items.length },
            { id: "pending", label: "Pending", count: pendingCount },
            { id: "rejected", label: "Rejected", count: rejectedCount },
            { id: "urgent", label: "Urgent", count: urgentCount },
          ] as { id: FilterTab; label: string; count: number }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] transition-all",
              tab === t.id
                ? "bg-ithina-purple/15 text-ithina-purple"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1 py-0.5 text-[8px] font-bold tabular-nums",
                tab === t.id ? "bg-ithina-purple/20 text-ithina-purple" : "bg-white/5 text-slate-500",
              )}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto" role="listbox" aria-label="Pending tasks">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle className="size-8 text-slate-600" />
            <p className="text-xs text-slate-500">
              {search ? `No results for "${search}"` : "No items in this filter"}
            </p>
            {search && (
              <button
                onClick={() => handleSearch("")}
                className="text-xs text-ithina-purple hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-px p-2">
            {pageItems.map((item) => {
              const origIdx = originalIndex(item);
              const isActive = activeIndex === origIdx;
              const isRejected = item.status === "rejected";
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isActive}
                  tabIndex={0}
                  onClick={() => onSelect(origIdx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(origIdx);
                    }
                  }}
                  className={cn(
                    "group relative cursor-pointer rounded-xl px-3.5 py-3 transition-all duration-150",
                    isActive && !isRejected && "border border-ithina-purple/25 bg-ithina-purple/10 shadow-[0_0_12px_rgba(168,85,247,0.05)]",
                    !isActive && !isRejected && "border border-transparent hover:border-ithina-border hover:bg-white/[0.03]",
                    isRejected && "border border-rose-400/20 bg-rose-400/5 opacity-80",
                  )}
                >
                  {/* Urgent dot */}
                  {item.urgent && (
                    <span className="absolute right-3 top-3.5 size-1.5 animate-pulse rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" />
                  )}

                  {/* Title row */}
                  <div className="mb-0.5 flex items-baseline gap-1.5 pr-4">
                    <span
                      className={cn(
                        "truncate text-xs font-semibold",
                        isRejected ? "text-rose-300" : isActive ? "text-white" : "text-slate-300 group-hover:text-white",
                      )}
                    >
                      {item.title}
                    </span>
                    {item.subtitle && (
                      <span className="shrink-0 text-[10px] font-medium text-rose-400">{item.subtitle}</span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-[10px]",
                        isRejected ? "text-rose-300/80" : isActive ? "text-slate-400" : "text-slate-500",
                      )}
                    >
                      {item.initiator} · <span className="text-slate-500">{item.skus} SKUs</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-[10px]",
                        isRejected
                          ? "text-rose-400"
                          : item.metaVariant === "success"
                            ? "text-emerald-400"
                            : "text-slate-600",
                      )}
                    >
                      {isRejected ? "Rejected" : item.meta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between border-t border-ithina-border px-4 py-2.5">
          <span className="font-mono text-[10px] text-slate-500">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex size-6 items-center justify-center rounded-md border border-ithina-border text-slate-400 transition-colors hover:border-ithina-purple/30 hover:text-ithina-purple disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="min-w-[3rem] text-center font-mono text-[10px] text-slate-400">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex size-6 items-center justify-center rounded-md border border-ithina-border text-slate-400 transition-colors hover:border-ithina-purple/30 hover:text-ithina-purple disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default memo(TaskInbox);
