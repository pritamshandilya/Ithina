import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import type { RefObject } from "react";
import { useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface ScheduleStepProps {
  onNext: () => void;
}

type SchedFilter = "All" | "Recurring" | "One-time";
type DeploymentType = "recurring" | "one-time";

interface ScheduledItem {
  id: number;
  name: string;
  day: number;
  time: string;
  type: DeploymentType;
}

/** Matches index_3.1.html `wizardScheduledItems` */
const WIZARD_SCHEDULED_ITEMS: ScheduledItem[] = [
  { id: 1, name: "Weekend Beverage Promo", day: 22, time: "08:00 AM", type: "recurring" },
  { id: 2, name: "Electronics Flash Sale", day: 28, time: "06:00 AM", type: "one-time" },
  { id: 3, name: "Easter Seasonal Push", day: 31, time: "00:01 AM", type: "one-time" },
];

const CAL_YEAR = 2026;
const CAL_MONTH = 2; // March (0-indexed)
const EVENT_DAYS = new Set([22, 28, 31]);

function buildCalendarCells(): { n?: number; empty: boolean; isToday: boolean; hasEvent: boolean }[] {
  const firstDow = new Date(CAL_YEAR, CAL_MONTH, 1).getDay();
  const daysInMonth = 31;
  const cells: { n?: number; empty: boolean; isToday: boolean; hasEvent: boolean }[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push({ empty: true, isToday: false, hasEvent: false });
  }
  for (let n = 1; n <= daysInMonth; n++) {
    cells.push({
      n,
      empty: false,
      isToday: n === 21,
      hasEvent: EVENT_DAYS.has(n),
    });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ empty: true, isToday: false, hasEvent: false });
  }
  return cells;
}

export default function ScheduleStep({ onNext }: ScheduleStepProps) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endDate, setEndDate] = useState("");
  const [autoApprove, setAutoApprove] = useState(false);
  const [schedFilter, setSchedFilter] = useState<SchedFilter>("All");
  const [selectedSchedDay, setSelectedSchedDay] = useState<number | null>(21);

  const startDateRef = useRef<HTMLInputElement | null>(null);
  const endDateRef = useRef<HTMLInputElement | null>(null);

  const calDays = useMemo(() => buildCalendarCells(), []);

  const filteredScheduled = useMemo(() => {
    if (schedFilter === "Recurring") return WIZARD_SCHEDULED_ITEMS.filter((s) => s.type === "recurring");
    if (schedFilter === "One-time") return WIZARD_SCHEDULED_ITEMS.filter((s) => s.type === "one-time");
    return WIZARD_SCHEDULED_ITEMS;
  }, [schedFilter]);

  const dayCampaigns = useMemo(
    () => (day: number) => WIZARD_SCHEDULED_ITEMS.filter((s) => s.day === day),
    [],
  );

  const openPicker = (ref: RefObject<HTMLInputElement | null>) => {
    const el = ref.current;
    if (!el) return;
    if ("showPicker" in el) {
      (el as HTMLInputElement & { showPicker: () => void }).showPicker();
      return;
    }
    el.focus();
    el.click();
  };

  return (
    <div className="flex min-h-0 flex-1 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
      <div className="flex h-full min-h-0 w-full overflow-hidden">
        {/* Left: schedule form — index_3.1.html ~1977–2018 */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto border-r border-ithina-border/50 px-6 py-6">
          <div>
            <h3 className="text-lg font-bold text-white">Schedule Deployment</h3>
            <p className="mt-0.5 text-sm text-slate-400">
              Set when this campaign goes live across your fleet.
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-ithina-border bg-ithina-panel p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    ref={startDateRef}
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full cursor-pointer rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => openPicker(startDateRef)}
                    className="pointer-events-auto absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-ithina-purple"
                    aria-label="Open start date picker"
                  >
                    <Calendar className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                End Date (optional)
              </label>
              <div className="relative">
                <input
                  ref={endDateRef}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                />
                <Calendar
                  className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                  strokeWidth={2}
                  aria-hidden
                />
              </div>
            </div>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all",
                autoApprove
                  ? "border-ithina-purple/30 bg-ithina-purple/5"
                  : "border-ithina-border hover:border-slate-500",
              )}
            >
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="size-4 accent-purple-500"
              />
              <div>
                <p className="text-xs font-semibold text-white">Auto-approve on schedule</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Bypasses approval queue. Only available for low-risk campaigns.
                </p>
              </div>
            </label>
          </div>
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 self-start rounded-xl bg-ithina-purple px-7 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover"
          >
            Review &amp; Submit
            <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
          </button>
        </div>

        {/* Centre: calendar — w-60, index_3.1.html ~2020–2065 */}
        <div className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-ithina-border/50">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">March 2026</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedSchedDay(22)}
                  className="rounded border border-ithina-purple/25 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-ithina-purple transition-colors hover:bg-ithina-purple/20"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="rounded-md border border-ithina-border/60 p-1 text-slate-500 transition-colors hover:text-white"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-3" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-ithina-border/60 p-1 text-slate-500 transition-colors hover:text-white"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-3" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="mb-1 grid grid-cols-7">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={`${d}${i}`} className="py-0.5 text-center font-mono text-[9px] text-slate-700">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((day, idx) => {
                if (day.empty || day.n == null) {
                  return <div key={`e-${idx}`} className="aspect-square" />;
                }
                const n = day.n;
                const selected = selectedSchedDay === n;
                const showDot =
                  day.hasEvent && !selected && !day.isToday;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedSchedDay(n)}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-md font-mono text-[10px] transition-colors",
                      selected
                        ? "bg-ithina-purple font-bold text-white ring-2 ring-ithina-purple/50"
                        : day.isToday
                          ? "cursor-pointer bg-ithina-purple/80 font-bold text-white"
                          : day.hasEvent
                            ? "cursor-pointer bg-ithina-purple/12 text-ithina-purple hover:bg-ithina-purple/25"
                            : "cursor-pointer text-slate-600 hover:bg-white/[0.04]",
                    )}
                  >
                    <span>{n}</span>
                    {showDot && (
                      <span className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-ithina-purple" />
                    )}
                  </button>
                );
              })}
            </div>

            {selectedSchedDay != null ? (
              <div className="mt-4 flex flex-col gap-2 border-t border-ithina-border/40 pt-4">
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-mono text-[10px] font-semibold text-white">Mar {selectedSchedDay}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedSchedDay(null)}
                    className="text-slate-600 transition-colors hover:text-white"
                    aria-label="Clear selection"
                  >
                    <X className="size-3" strokeWidth={2} />
                  </button>
                </div>
                {dayCampaigns(selectedSchedDay).length === 0 ? (
                  <div className="py-2 text-center">
                    <p className="text-[10px] text-slate-600">No campaigns on this day</p>
                  </div>
                ) : (
                  dayCampaigns(selectedSchedDay).map((sc) => (
                    <div
                      key={sc.id}
                      className="rounded-lg border border-ithina-border/60 bg-ithina-bg/40 p-2"
                    >
                      <p className="text-[10px] font-semibold leading-tight text-white">{sc.name}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[9px] text-slate-500">{sc.time}</span>
                        <span
                          className={cn(
                            "rounded px-1 py-0.5 font-mono text-[8px] uppercase",
                            sc.type === "recurring"
                              ? "bg-blue-400/10 text-blue-400"
                              : "bg-ithina-purple/10 text-ithina-purple",
                          )}
                        >
                          {sc.type}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="mt-4 border-t border-ithina-border/40 pt-4 text-center">
                <p className="text-[10px] text-slate-600">Click a date to see campaigns</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: upcoming deployments — index_3.1.html ~2067–2106 */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 p-5">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Upcoming Deployments · {WIZARD_SCHEDULED_ITEMS.length}
              </p>
              <div className="flex gap-1">
                {(["All", "Recurring", "One-time"] as const).map((sf) => (
                  <button
                    key={sf}
                    type="button"
                    onClick={() => setSchedFilter(sf)}
                    className={cn(
                      "rounded border px-2.5 py-1 text-[10px] font-medium transition-all",
                      schedFilter === sf
                        ? "border-ithina-purple/30 bg-ithina-purple/10 text-ithina-purple"
                        : "border-ithina-border/40 text-slate-500 hover:text-white",
                    )}
                  >
                    {sf}
                  </button>
                ))}
              </div>
            </div>
            {filteredScheduled.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSchedDay(s.day)}
                className="group cursor-pointer rounded-xl border border-ithina-border/60 bg-ithina-panel p-4 text-left transition-colors hover:border-ithina-purple/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        s.type === "recurring" ? "bg-blue-500/10" : "bg-ithina-purple/10",
                      )}
                    >
                      {s.type === "recurring" ? (
                        <RefreshCw className="size-3.5 text-blue-400" strokeWidth={1.5} aria-hidden />
                      ) : (
                        <Calendar className="size-3.5 text-ithina-purple" strokeWidth={1.5} aria-hidden />
                      )}
                    </div>
                    <div>
                      <div className="mb-0.5 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-white">{s.name}</span>
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wide",
                            s.type === "recurring"
                              ? "bg-blue-400/10 text-blue-400"
                              : "bg-ithina-purple/10 text-ithina-purple",
                          )}
                        >
                          {s.type === "recurring" ? "RECURRING" : "ONE-TIME"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Mar {s.day} · {s.time}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] text-emerald-400">
                      <Check className="size-2.5" strokeWidth={2} aria-hidden />
                      Approved
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
