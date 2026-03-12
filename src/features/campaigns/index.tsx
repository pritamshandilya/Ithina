import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Plus, Search, Table2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { activateCampaign } from "@/store/slices/campaign-slice";
import type { CampaignFilterOption, CampaignListStatus } from "@/types/campaigns";
import {
  useCalendarWeekdays,
  useCampaignFilters,
  useCampaignList,
  useCampaignStatDefinitions,
  useCampaignStatusStyles,
  useCampaignTableColumns,
  useMonthNames,
} from "@/hooks/use-campaigns";

export default function Campaigns() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: campaigns = [], isLoading: listLoading, isError: listError } = useCampaignList();
  const { data: filters = [], isLoading: filtersLoading } = useCampaignFilters();
  const { data: statDefs = [], isLoading: statsLoading } = useCampaignStatDefinitions();
  const { data: statusStyles, isLoading: stylesLoading } = useCampaignStatusStyles();
  const { data: tableColumns = [], isLoading: columnsLoading } = useCampaignTableColumns();
  const { data: weekdays = [], isLoading: weekdaysLoading } = useCalendarWeekdays();
  const { data: monthNames = [], isLoading: monthsLoading } = useMonthNames();

  const isLoading = listLoading || filtersLoading || statsLoading || stylesLoading || columnsLoading || weekdaysLoading || monthsLoading;
  const isError = listError;

  const [activeFilter, setActiveFilter] = useState<CampaignFilterOption>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchFilter = activeFilter === "All" || c.status === activeFilter;
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [campaigns, activeFilter, search]);

  const stats = useMemo(() => {
    return statDefs.map((def) => ({
      ...def,
      value: def.countStatus === null ? campaigns.length : campaigns.filter((c) => c.status === def.countStatus).length,
    }));
  }, [statDefs, campaigns]);

  const calMonthLabel = monthNames.length > 0 ? `${monthNames[calMonth]} ${calYear}` : "";

  const prevMonth = useCallback(() => {
    setCalMonth((m) => { if (m === 0) { setCalYear((y) => y - 1); return 11; } return m - 1; });
  }, []);

  const nextMonth = useCallback(() => {
    setCalMonth((m) => { if (m === 11) { setCalYear((y) => y + 1); return 0; } return m + 1; });
  }, []);

  const campaignEvents = useMemo(() => {
    if (!statusStyles || monthNames.length === 0) return {};
    const map: Record<string, Array<{ name: string; cls: string }>> = {};
    for (const c of campaigns) {
      const match = c.date.match(/(\w+)\s+(\d+)\s+(\d+)/);
      if (match) {
        const monthIdx = monthNames.findIndex((m) => m.startsWith(match[1]));
        const day = parseInt(match[2]);
        const year = parseInt(match[3]);
        if (year === calYear && monthIdx === calMonth) {
          const key = String(day);
          if (!map[key]) map[key] = [];
          const style = statusStyles[c.status as CampaignListStatus];
          map[key].push({
            name: c.name.length > 20 ? c.name.slice(0, 18) + "…" : c.name,
            cls: style?.calendar ?? "",
          });
        }
      }
    }
    return map;
  }, [campaigns, calYear, calMonth, monthNames, statusStyles]);

  const calendarCells = useMemo(() => {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === calYear && today.getMonth() === calMonth;
    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const days: Array<{ day: number | string; isToday?: boolean; events: Array<{ name: string; cls: string }> }> = [];
    for (let i = 0; i < startOffset; i++) days.push({ day: "", events: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, isToday: isCurrentMonth && d === today.getDate(), events: campaignEvents[String(d)] || [] });
    }
    while (days.length % 7 !== 0) days.push({ day: "", events: [] });
    return days;
  }, [calYear, calMonth, campaignEvents]);

  const openInStudio = (c: { name: string }) => {
    dispatch(activateCampaign(c.name));
    navigate({ to: "/studio" });
  };

  const pageHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Campaigns", isActive: true }]}
      title="Campaign History & Schedule"
    />
  );

  if (isError) {
    return (
      <>
        {pageHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load campaigns</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {pageHeader}

      {isLoading ? (
        <LoadingSpinner label="Loading campaigns..." className="flex-1" />
      ) : (
        <div className="flex flex-1 flex-col gap-5 overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
          <div className="flex shrink-0 items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Campaigns</h2>
              <p className="mt-1 text-sm text-slate-400">All campaigns — past, scheduled and in-progress.</p>
            </div>
            <button
              onClick={() => navigate({ to: "/wizard" })}
              className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all hover:bg-ithina-purple-hover"
            >
              <Plus className="size-4" />
              New Campaign
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-ithina-border bg-ithina-panel p-4 shadow-sm">
                <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{s.label}</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className={cn("text-2xl font-bold tracking-tight", s.color)}>{s.value}</span>
                  <span className={cn("mb-0.5 font-mono text-[10px]", s.color)}>{s.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search campaigns..."
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-2 pl-9 pr-3 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                aria-label="Search campaigns"
              />
            </div>
            <div className="flex gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel p-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "rounded px-3 py-1.5 text-xs font-medium transition-all",
                    activeFilter === f ? "bg-ithina-purple text-white" : "text-slate-400 hover:text-white",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <div className="flex overflow-hidden rounded-lg border border-ithina-border bg-ithina-panel">
              <button onClick={() => setViewMode("table")} className={cn("px-3 py-2 transition-colors", viewMode === "table" ? "bg-ithina-purple/20 text-ithina-purple" : "text-slate-500 hover:text-white")}>
                <Table2 className="size-4" />
              </button>
              <button onClick={() => setViewMode("calendar")} className={cn("px-3 py-2 transition-colors", viewMode === "calendar" ? "bg-ithina-purple/20 text-ithina-purple" : "text-slate-500 hover:text-white")}>
                <CalendarDays className="size-4" />
              </button>
            </div>
          </div>

          {viewMode === "table" && statusStyles && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="sticky top-0 z-10 border-b border-ithina-border bg-ithina-sidebar">
                    <tr className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {tableColumns.map((col) => (
                        <th
                          key={col.key}
                          className={cn(
                            "px-4 py-3",
                            col.key === "campaign" && "pl-8 pr-6",
                            col.key === "actions" && "px-6 text-right",
                          )}
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ithina-border/50 text-sm">
                    {filtered.map((c) => (
                      <tr key={c.id} className="group transition-colors hover:bg-white/[0.02]">
                        <td className="py-4 pl-8 pr-6">
                          <span className="mb-0.5 block font-medium text-white">{c.name}</span>
                          <span className="block font-mono text-[10px] text-slate-500">{c.id}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px]", statusStyles[c.status]?.table)}>
                            {c.status === "Active" && <span className="size-1.5 animate-pulse rounded-full bg-current" />}
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono text-sm text-slate-300">{c.skus}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1">
                            {c.hardware.map((hw) => (
                              <span key={hw} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-slate-400">{hw}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 font-mono text-xs text-slate-400">{c.date}</td>
                        <td className="px-4 py-4 text-xs text-slate-400">{c.initiator}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button onClick={() => openInStudio(c)} className="rounded-lg border border-ithina-purple/20 bg-ithina-purple/10 px-2.5 py-1.5 text-[10px] font-medium text-ithina-purple transition-all hover:bg-ithina-purple hover:text-white">
                              Edit in Studio
                            </button>
                            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:text-white">
                              Duplicate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/30 px-6 py-3 text-xs text-slate-500">
                <span>{filtered.length} campaigns</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">Page 1 of 1</span>
                  <div className="flex gap-1">
                    <button className="rounded border border-ithina-border bg-ithina-panel px-2.5 py-1 transition-colors hover:border-ithina-purple"><ChevronLeft className="size-3" /></button>
                    <button className="rounded border border-ithina-border bg-ithina-panel px-2.5 py-1 transition-colors hover:border-ithina-purple"><ChevronRight className="size-3" /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === "calendar" && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
              <div className="flex shrink-0 items-center justify-between border-b border-ithina-border px-6 py-4">
                <h3 className="text-base font-semibold text-white">{calMonthLabel}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { const now = new Date(); setCalYear(now.getFullYear()); setCalMonth(now.getMonth()); }}
                    className="rounded border border-ithina-border px-2.5 py-1 font-mono text-[10px] text-slate-400 transition-colors hover:border-ithina-purple hover:text-white"
                  >
                    Today
                  </button>
                  <button onClick={prevMonth} className="rounded border border-ithina-border p-1.5 text-slate-400 transition-colors hover:border-ithina-purple hover:text-white" aria-label="Previous month"><ChevronLeft className="size-4" /></button>
                  <button onClick={nextMonth} className="rounded border border-ithina-border p-1.5 text-slate-400 transition-colors hover:border-ithina-purple hover:text-white" aria-label="Next month"><ChevronRight className="size-4" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-7 gap-px rounded-xl bg-ithina-border">
                  {weekdays.map((d) => (
                    <div key={d} className="bg-ithina-sidebar px-2 py-2 text-center font-mono text-[10px] uppercase text-slate-500">{d}</div>
                  ))}
                  {calendarCells.map((cell, idx) => (
                    <div key={idx} className={cn("relative min-h-[80px] bg-ithina-bg p-2", cell.isToday && "ring-1 ring-inset ring-ithina-purple")}>
                      <span className={cn("font-mono text-[11px]", cell.isToday ? "font-bold text-ithina-purple" : "text-slate-500")}>{cell.day}</span>
                      {cell.events.map((ev) => (
                        <div key={ev.name} className={cn("mt-1 truncate rounded px-1.5 py-0.5 text-[9px] font-medium", ev.cls)}>{ev.name}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
