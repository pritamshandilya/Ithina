import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Plus, Search, Table2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { activateCampaign, activateCampaignWithId } from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";
import type { CampaignCreateForm, CampaignFilterOption, CampaignListItem, CampaignListStatus } from "@/types/campaigns";
import {
  useCalendarWeekdays,
  useCampaignFilters,
  useCampaignList,
  useCampaignStatDefinitions,
  useCampaignStatusStyles,
  useCreateCampaign,
  useDeleteCampaign,
  useMonthNames,
  useUpdateCampaign,
} from "@/hooks/use-campaigns";
import CampaignModal from "./components/campaign-modal";

const EMPTY_FORM: CampaignCreateForm = {
  name: "",
  status: "Draft",
  skus: 0,
  hardware: "",
  initiator: "",
  scheduled_date: "",
};

export default function Campaigns() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: campaigns = [], isLoading: listLoading, isError: listError } = useCampaignList();
  const { data: filters = [], isLoading: filtersLoading } = useCampaignFilters();
  const { data: statDefs = [], isLoading: statsLoading } = useCampaignStatDefinitions();
  const { data: statusStyles, isLoading: stylesLoading } = useCampaignStatusStyles();
  const { data: weekdays = [], isLoading: weekdaysLoading } = useCalendarWeekdays();
  const { data: monthNames = [], isLoading: monthsLoading } = useMonthNames();

  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  const isLoading = listLoading || filtersLoading || statsLoading || stylesLoading || weekdaysLoading || monthsLoading;
  const isError = listError;

  const [activeFilter, setActiveFilter] = useState<CampaignFilterOption>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setModalForm(EMPTY_FORM);
    setEditingId(null);
    setModalMode("create");
  }, []);

  const openEdit = useCallback((c: CampaignListItem) => {
    setModalForm({
      name: c.name,
      status: c.status,
      skus: c.skus,
      hardware: c.hardware.join(", "),
      initiator: c.initiator,
      scheduled_date: c.date,
    });
    setEditingId(c.id);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (modalMode === "create") {
      createMutation.mutate(modalForm, { onSuccess: closeModal });
    } else if (modalMode === "edit" && editingId) {
      updateMutation.mutate({ id: editingId, form: modalForm }, { onSuccess: closeModal });
    }
  }, [modalMode, modalForm, editingId, createMutation, updateMutation, closeModal]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, { onSuccess: () => setDeleteConfirmId(null) });
    }
  }, [deleteConfirmId, deleteMutation]);

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

  const openInStudio = useCallback((c: CampaignListItem) => {
    dispatch(activateCampaignWithId({ id: c.id, name: c.name }));
    navigate({ to: "/studio" });
  }, [dispatch, navigate]);

  const duplicateCampaign = useCallback(
    (c: CampaignListItem) => {
      const duplicateName = `${c.name} (Copy)`;
      dispatch(activateCampaign(duplicateName));
      dispatch(resetStudio());
      navigate({ to: "/studio" });
    },
    [dispatch, navigate],
  );

  const tableColumns = useMemo<DataTableColumn<CampaignListItem>[]>(() => {
    if (!statusStyles) return [];
    return [
      {
        title: "Campaign",
        field: "name",
        minWidth: 200,
        hozAlign: "left",
        headerHozAlign: "left",
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => CampaignListItem }).getData();
          return `<div><span class="block font-medium text-white">${row.name}</span><span class="block font-mono text-[10px] text-slate-500">${row.id}</span></div>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 120,
        formatter: (cell: unknown) => {
          const row = (cell as { getData: () => CampaignListItem }).getData();
          const cls = statusStyles[row.status]?.table ?? "";
          const dot = row.status === "Active" ? `<span class="size-1.5 animate-pulse rounded-full bg-current inline-block mr-1.5"></span>` : "";
          return `<span class="inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] ${cls}">${dot}${row.status}</span>`;
        },
      },
      {
        title: "SKUs",
        field: "skus",
        width: 80,
        sorter: "number",
        formatter: (cell: unknown) => {
          const val = (cell as { getValue: () => number }).getValue();
          return `<span class="font-mono text-sm text-slate-300">${val}</span>`;
        },
      },
      {
        title: "Hardware",
        field: "hardware",
        minWidth: 150,
        headerSort: false,
        formatter: (cell: unknown) => {
          const hw = (cell as { getValue: () => string[] }).getValue();
          return hw.map((h) => `<span class="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] text-slate-400 mr-1">${h}</span>`).join("");
        },
      },
      {
        title: "Date",
        field: "date",
        width: 130,
        formatter: (cell: unknown) => {
          const val = (cell as { getValue: () => string }).getValue();
          return `<span class="font-mono text-xs text-slate-400">${val}</span>`;
        },
      },
      {
        title: "Initiator",
        field: "initiator",
        width: 140,
        formatter: (cell: unknown) => {
          const val = (cell as { getValue: () => string }).getValue();
          return `<span class="text-xs text-slate-400">${val}</span>`;
        },
      },
      {
        title: "Actions",
        field: "id",
        width: 280,
        headerSort: false,
        headerFilter: false,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () =>
          `<div class="flex items-center justify-end gap-1.5">` +
          `<button data-action="quick-edit" class="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-[10px] font-medium text-sky-400 transition-all hover:bg-sky-500 hover:text-white">Edit</button>` +
          `<button data-action="studio" class="rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1.5 text-[10px] font-medium text-purple-400 transition-all hover:bg-purple-500 hover:text-white">Studio</button>` +
          `<button data-action="duplicate" class="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-slate-400 transition-all hover:text-white">Duplicate</button>` +
          `<button data-action="delete" class="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-[10px] font-medium text-rose-400 transition-all hover:bg-rose-500 hover:text-white">Delete</button>` +
          `</div>`,
        cellClick: (_e: MouseEvent, cell: { getData: () => CampaignListItem }) => {
          const target = (_e as unknown as { target: HTMLElement }).target as HTMLElement;
          const btn = target.closest?.("[data-action]");
          if (!btn) return;
          _e.stopPropagation();
          const action = btn.getAttribute("data-action");
          if (action === "quick-edit") openEdit(cell.getData());
          if (action === "studio") openInStudio(cell.getData());
          if (action === "duplicate") duplicateCampaign(cell.getData());
          if (action === "delete") handleDelete(cell.getData().id);
        },
      },
    ];
  }, [statusStyles, openEdit, openInStudio, duplicateCampaign, handleDelete]);

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <AlertTriangle className="size-10 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Failed to load campaigns</h3>
        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <>
      {modalMode && (
        <CampaignModal
          mode={modalMode}
          form={modalForm}
          onChange={setModalForm}
          onSave={handleSave}
          onClose={closeModal}
          isSaving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {deleteConfirmId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="flex w-full max-w-sm animate-[fadeIn_0.3s_ease-out] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-2xl">
            <header className="flex items-center gap-3 border-b border-ithina-border bg-white/[0.02] px-6 py-4">
              <AlertTriangle className="size-5 shrink-0 text-rose-400" />
              <h2 className="text-base font-bold text-white">Delete Campaign</h2>
            </header>
            <div className="bg-ithina-bg/50 px-6 py-5">
              <p className="text-sm text-slate-300">Are you sure you want to delete this campaign? This action cannot be undone.</p>
            </div>
            <footer className="flex justify-end gap-3 border-t border-ithina-border bg-white/[0.02] p-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner label="Loading campaigns..." className="flex-1" />
      ) : (
        <div className="flex flex-1 flex-col gap-5 overflow-hidden p-6 animate-[fadeIn_0.4s_ease-out] lg:p-8">
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
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-lg bg-ithina-purple px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all hover:bg-ithina-purple-hover"
            >
              <Plus className="size-3.5" />
              New Campaign
            </button>
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
            <DataTable<CampaignListItem>
              columns={tableColumns}
              data={filtered}
              rowIdField="id"
              emptyMessage="No campaigns match the current filters"
              pageSize={10}
              pageSizeSelector={[5, 10, 20, 50]}
              initialSort={{ field: "date", dir: "desc" }}
              showRowNumber
            />
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
