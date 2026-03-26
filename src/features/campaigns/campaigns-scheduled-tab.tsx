import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useAppDispatch } from "@/store/hooks";
import { setCampaignName } from "@/store/slices/campaign-slice";

type ScheduledItem = {
  id: number;
  name: string;
  type: "recurring" | "one-time";
  date: string;
  day: number;
  time: string;
  targets: string;
  skus: number;
  approvalRequired: boolean;
};

const SCHEDULED_ITEMS: ScheduledItem[] = [
  {
    id: 1,
    name: "Weekend Beverage Promo",
    type: "recurring",
    date: "Sat, Mar 22",
    day: 22,
    time: "08:00 AM",
    targets: 'ESL 4.2" · LCD 10"',
    skus: 14,
    approvalRequired: false,
  },
  {
    id: 2,
    name: "Electronics Flash Sale",
    type: "one-time",
    date: "Fri, Mar 28",
    day: 28,
    time: "06:00 AM",
    targets: 'ESL 2.9", ESL 4.2"',
    skus: 8,
    approvalRequired: true,
  },
  {
    id: 3,
    name: "Easter Seasonal Push",
    type: "one-time",
    date: "Sun, Mar 31",
    day: 31,
    time: "00:01 AM",
    targets: "All ESL · All LCD",
    skus: 42,
    approvalRequired: true,
  },
];

/** index_3.1.html — March 2026 calendar markers */
const EVENT_DAYS = new Set([21, 22, 24, 28, 29, 31]);
const TODAY_DAY = 21;

export default function CampaignsScheduledTab() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>(SCHEDULED_ITEMS);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);

  const calendarCells = useMemo(() => {
    const year = 2026;
    const monthIdx = 2;
    const firstDow = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const cells: Array<{ day: number | null; hasEvent: boolean; isToday: boolean }> = [];
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, hasEvent: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        hasEvent: EVENT_DAYS.has(d),
        isToday: d === TODAY_DAY,
      });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, hasEvent: false, isToday: false });
    return cells;
  }, []);

  const filtered = selectedCalDay
    ? scheduledItems.filter((x) => x.day === selectedCalDay)
    : scheduledItems;

  const handleEdit = (item: ScheduledItem) => {
    dispatch(setCampaignName(item.name));
    navigate({ to: "/wizard" });
  };

  const handleCancel = (item: ScheduledItem) => {
    const shouldCancel = window.confirm(`Cancel scheduled campaign "${item.name}"?`);
    if (!shouldCancel) return;
    setScheduledItems((prev) => prev.filter((campaign) => campaign.id !== item.id));
  };

  return (
    <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
      <div className="w-64 shrink-0 border-r border-ithina-border/40 flex flex-col">
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white">March 2026</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="px-2 py-0.5 text-[9px] font-mono font-semibold text-ithina-purple bg-ithina-purple/10 border border-ithina-purple/25 rounded transition-colors hover:bg-ithina-purple/20"
                onClick={() => setSelectedCalDay(22)}
              >
                Today
              </button>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors"
                aria-label="Next month"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              <div key={`${d}-${idx}`} className="text-center text-[9px] font-mono text-slate-700 py-0.5">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {calendarCells.map((cell, idx) => {
              if (!cell.day) return <div key={idx} className="aspect-square" />;
              const isSelected = selectedCalDay === cell.day;
              const hasEvent = cell.hasEvent;

              return (
                <button
                  key={idx}
                  type="button"
                  className={[
                    "aspect-square flex items-center justify-center rounded-md text-[10px] font-mono transition-colors relative",
                    isSelected
                      ? "bg-ithina-purple text-white font-bold ring-2 ring-ithina-purple/40"
                      : cell.isToday
                        ? "bg-ithina-purple/80 text-white font-bold"
                        : hasEvent
                          ? "bg-ithina-purple/12 text-ithina-purple hover:bg-ithina-purple/25 cursor-pointer"
                          : "text-slate-600 hover:bg-white/[0.04] cursor-pointer",
                  ].join(" ")}
                  onClick={() => setSelectedCalDay(cell.day)}
                >
                  <span>{cell.day}</span>
                  {hasEvent && !isSelected && !cell.isToday ? (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ithina-purple" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-ithina-border/40">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest text-center">
              Use the Campaign Wizard to schedule a new deployment
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {selectedCalDay ? `Mar ${selectedCalDay}` : "UPCOMING"} - {filtered.length} deployment
              {filtered.length !== 1 ? "s" : ""}
            </p>
            {selectedCalDay ? (
              <button
                type="button"
                onClick={() => setSelectedCalDay(null)}
                className="text-[9px] text-slate-600 hover:text-white border border-ithina-border/40 rounded px-1.5 py-0.5 transition-colors"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-ithina-panel border border-ithina-border rounded-2xl p-5 flex items-start justify-between gap-4 transition-all duration-150 hover:border-ithina-purple/40 hover:shadow-[0_0_0_1px_rgba(168,85,247,0.25)]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl border border-ithina-purple/20 bg-ithina-purple/10 flex items-center justify-center">
                      <span className="size-2 rounded-sm bg-ithina-purple" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{item.targets}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{item.skus} SKUs</p>
                      <div className="mt-2">
                        {item.approvalRequired ? (
                          <span className="inline-flex h-6 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 text-[10px] font-semibold text-amber-400 whitespace-nowrap">
                            Needs Approval
                          </span>
                        ) : (
                          <span className="inline-flex h-6 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-900/40 px-2.5 text-[10px] font-semibold text-emerald-400 whitespace-nowrap">
                            Auto-approved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-[120px] text-right">
                  <p className="text-xs font-semibold text-white whitespace-nowrap">{item.date}</p>
                  <p className="mt-1 text-[10px] font-mono text-slate-500 whitespace-nowrap">{item.time}</p>
                  <div className="mt-3 flex items-center justify-end gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="inline-flex h-5 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-slate-400 transition-colors hover:text-white hover:bg-white/5"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(item)}
                      className="inline-flex h-5 min-w-[40px] items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-rose-400 transition-colors hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
