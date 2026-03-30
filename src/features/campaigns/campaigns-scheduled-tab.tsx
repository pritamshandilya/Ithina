import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useInboxItems } from "@/hooks/use-approval";
import { useAppDispatch } from "@/store/hooks";
import { setCampaignName } from "@/store/slices/campaign-slice";

type ScheduledItem = {
  id: string;
  name: string;
  source: "mock" | "approval";
  type: "recurring" | "one-time";
  date: string;
  day: number;
  time: string;
  targets: string;
  skus: number;
  approvalRequired: boolean;
  scheduledAt: Date;
};

const SCHEDULED_ITEMS: ScheduledItem[] = [
  {
    id: "mock-1",
    name: "Weekend Beverage Promo",
    source: "mock",
    type: "recurring",
    date: "Sat, Mar 22",
    day: 22,
    time: "08:00 AM",
    targets: 'ESL 4.2" · LCD 10"',
    skus: 14,
    approvalRequired: false,
    scheduledAt: new Date("2026-03-22T08:00:00"),
  },
  {
    id: "mock-2",
    name: "Electronics Flash Sale",
    source: "mock",
    type: "one-time",
    date: "Fri, Mar 28",
    day: 28,
    time: "06:00 AM",
    targets: 'ESL 2.9", ESL 4.2"',
    skus: 8,
    approvalRequired: true,
    scheduledAt: new Date("2026-03-28T06:00:00"),
  },
  {
    id: "mock-3",
    name: "Easter Seasonal Push",
    source: "mock",
    type: "one-time",
    date: "Sun, Mar 31",
    day: 31,
    time: "00:01 AM",
    targets: "All ESL · All LCD",
    skus: 42,
    approvalRequired: true,
    scheduledAt: new Date("2026-03-31T00:01:00"),
  },
];

function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function parseDateLabelToDate(dateLabel?: string): Date | null {
  if (!dateLabel || dateLabel === "Immediate") return null;
  const clean = dateLabel.replace(/^[A-Za-z]{3},\s*/, "").trim();
  const [monthRaw, dayRaw] = clean.split(/\s+/);
  const day = Number(dayRaw);
  if (!monthRaw || !Number.isFinite(day)) return null;
  const monthIdx = new Date(`${monthRaw} 1, 2000`).getMonth();
  if (!Number.isFinite(monthIdx)) return null;
  return new Date(new Date().getFullYear(), monthIdx, day);
}

function parseTimeLabelToHourMinute(timeLabel?: string): { hours: number; minutes: number } {
  if (!timeLabel) return { hours: 8, minutes: 0 };
  const m = timeLabel.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return { hours: 8, minutes: 0 };
  let hours = Number(m[1]);
  const minutes = Number(m[2]);
  const suffix = (m[3] ?? "").toUpperCase();
  if (suffix === "PM" && hours < 12) hours += 12;
  if (suffix === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

export default function CampaignsScheduledTab() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: inbox = [] } = useInboxItems();
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>(SCHEDULED_ITEMS);
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(new Date().getDate());
  const [calendarCursor, setCalendarCursor] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const approvedScheduledItems = useMemo<ScheduledItem[]>(() => {
    return inbox
      .filter((item) => item.status === "approved")
      .map((item) => {
        const datePart = parseDateLabelToDate(item.scheduledDate) ?? new Date();
        const { hours, minutes } = parseTimeLabelToHourMinute(item.scheduledTime);
        const scheduledAt = new Date(
          datePart.getFullYear(),
          datePart.getMonth(),
          datePart.getDate(),
          hours,
          minutes,
          0,
        );
        const day = scheduledAt.getDate();
        const date =
          item.scheduledDate && item.scheduledDate !== "Immediate"
            ? item.scheduledDate
            : scheduledAt.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "2-digit",
              });
        return {
          id: item.id,
          name: item.title,
          source: "approval" as const,
          type: "one-time" as const,
          date,
          day,
          time: item.scheduledTime ?? "08:00 AM",
          targets: (item.hardwareTargets ?? ['ESL 4.2"']).join(", "),
          skus: item.skus,
          approvalRequired: false,
          scheduledAt,
        };
      });
  }, [inbox]);

  const allScheduledItems = useMemo(() => {
    const merged = [...scheduledItems];
    for (const item of approvedScheduledItems) {
      if (!merged.some((existing) => existing.id === item.id)) {
        merged.unshift(item);
      }
    }
    return merged;
  }, [approvedScheduledItems, scheduledItems]);

  const pendingScheduledItems = useMemo(
    () => allScheduledItems.filter((item) => item.scheduledAt.getTime() > nowTs),
    [allScheduledItems, nowTs],
  );

  const monthEventDays = useMemo(() => {
    const key = toMonthKey(calendarCursor);
    return new Set(
      pendingScheduledItems
        .filter((item) => toMonthKey(item.scheduledAt) === key)
        .map((item) => item.scheduledAt.getDate()),
    );
  }, [calendarCursor, pendingScheduledItems]);

  const calendarCells = useMemo(() => {
    const year = calendarCursor.getFullYear();
    const monthIdx = calendarCursor.getMonth();
    const firstDow = new Date(year, monthIdx, 1).getDay();
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    const cells: Array<{ day: number | null; hasEvent: boolean; isToday: boolean }> = [];
    const today = new Date();
    for (let i = 0; i < firstDow; i++) cells.push({ day: null, hasEvent: false, isToday: false });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        hasEvent: monthEventDays.has(d),
        isToday:
          d === today.getDate() &&
          monthIdx === today.getMonth() &&
          year === today.getFullYear(),
      });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, hasEvent: false, isToday: false });
    return cells;
  }, [calendarCursor, monthEventDays]);

  const filtered = selectedCalDay
    ? pendingScheduledItems.filter(
        (x) =>
          x.day === selectedCalDay &&
          x.scheduledAt.getMonth() === calendarCursor.getMonth() &&
          x.scheduledAt.getFullYear() === calendarCursor.getFullYear(),
      )
    : pendingScheduledItems.filter(
        (x) =>
          x.scheduledAt.getMonth() === calendarCursor.getMonth() &&
          x.scheduledAt.getFullYear() === calendarCursor.getFullYear(),
      );

  const handleEdit = (item: ScheduledItem) => {
    dispatch(setCampaignName(item.name));
    navigate({ to: "/wizard" });
  };

  const handleCancel = (item: ScheduledItem) => {
    const shouldCancel = window.confirm(`Cancel scheduled campaign "${item.name}"?`);
    if (!shouldCancel) return;
    if (item.source === "approval") return;
    setScheduledItems((prev) => prev.filter((campaign) => campaign.id !== item.id));
  };

  return (
    <div className="flex flex-1 gap-0 min-h-0 overflow-hidden">
      <div className="w-64 shrink-0 border-r border-ithina-border/40 flex flex-col">
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white">
              {calendarCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                className="px-2 py-0.5 text-[9px] font-mono font-semibold text-ithina-purple bg-ithina-purple/10 border border-ithina-purple/25 rounded transition-colors hover:bg-ithina-purple/20"
                onClick={() => {
                  const today = new Date();
                  setCalendarCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedCalDay(today.getDate());
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors"
                aria-label="Previous month"
                onClick={() =>
                  setCalendarCursor(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors"
                aria-label="Next month"
                onClick={() =>
                  setCalendarCursor(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
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
              {selectedCalDay
                ? `${calendarCursor.toLocaleDateString("en-US", { month: "short" })} ${selectedCalDay}`
                : "UPCOMING"}{" "}
              - {filtered.length} deployment
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
