import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import {
  PrototypeTabulator,
  type PrototypeTabulatorColumn,
} from "@/components/ui/prototype-tabulator";
import CampaignModal from "./components/campaign-modal";
import CampaignsScheduledTab from "./campaigns-scheduled-tab";
import type { CampaignCreateForm, CampaignListItem, CampaignListStatus } from "@/types/campaigns";
import { derivePipelineForRow } from "@/services/campaigns";
import { useCampaignList, useDeleteCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";

type ActiveTab = "all" | "scheduled";
type StatusFilter = "all" | "active" | "scheduled" | "draft" | "completed";

function toProto(status: CampaignListStatus): Exclude<StatusFilter, "all"> | "pending" {
  switch (status) {
    case "Active":    return "active";
    case "Scheduled": return "scheduled";
    case "Completed": return "completed";
    case "Draft":     return "draft";
    default:          return "pending";
  }
}

type ProtoStatus = ReturnType<typeof toProto>;

const STATUS_CLASS: Record<ProtoStatus, string> = {
  active:    "text-ithina-purple border-ithina-purple/30 bg-ithina-purple/8",
  scheduled: "text-amber-400 border-amber-400/30 bg-amber-400/8",
  completed: "text-emerald-400 border-emerald-400/30 bg-emerald-400/8",
  draft:     "text-slate-400 border-slate-600/60 bg-white/4",
  pending:   "text-orange-400 border-orange-400/30 bg-orange-400/8",
};

const PIPELINE_STAGE_CLASS: Record<string, string> = {
  Deployed:    "text-emerald-400 font-semibold",
  Scheduled:   "text-amber-400 font-semibold",
  Approval:    "text-orange-400 font-semibold",
  "Guard Rails": "text-ithina-purple font-semibold",
  Design:      "text-blue-400 font-semibold",
  Data:        "text-slate-400 font-semibold",
};

/* ── cell HTML helpers ── */
function statusCellHtml(protoStatus: ProtoStatus) {
  const cls = STATUS_CLASS[protoStatus];
  const label = protoStatus.charAt(0).toUpperCase() + protoStatus.slice(1);
  const dot = protoStatus === "active"
    ? `<span class="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5 shrink-0"></span>`
    : "";
  return `<span class="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-1 rounded-md border ${cls}">${dot}${label}</span>`;
}

function pipelineCellHtml(pipeline: string[]) {
  return pipeline
    .map((stage, i) => {
      const cls = i === pipeline.length - 1 ? (PIPELINE_STAGE_CLASS[stage] ?? "text-slate-400") : "text-slate-600 line-through";
      const sep = i < pipeline.length - 1
        ? `<svg class="w-2.5 h-2.5 text-slate-700 shrink-0 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`
        : "";
      return `<span class="text-[9px] font-mono whitespace-nowrap ${cls}">${stage}</span>${sep}`;
    })
    .join("");
}

function hardwareCellHtml(hw: string[]) {
  return `<div class="flex flex-wrap gap-1">${hw
    .map((h) => {
      const cls = h.startsWith("ESL")
        ? "bg-blue-400/8 border-blue-400/20 text-blue-300"
        : "bg-amber-400/8 border-amber-400/20 text-amber-300";
      return `<span class="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${cls}">${h}</span>`;
    })
    .join("")}</div>`;
}

/* ── row shape fed to tabulator ── */
type CampaignRow = CampaignListItem & {
  _protoStatus: ProtoStatus;
  _pipeline: string[];
  _paused: boolean;
};

const EMPTY_FORM: CampaignCreateForm = {
  name: "", status: "Draft", skus: 0, hardware: "", initiator: "", scheduled_date: "",
};

function TabAllIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function TabScheduledIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function CampaignsPrototype() {
  const { data: campaigns = [], isLoading, isError } = useCampaignList();
  const deleteMutation = useDeleteCampaign();
  const updateMutation = useUpdateCampaign();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);

  const [pausedById, setPausedById] = useState<Record<string, boolean>>({});
  const pausedByIdRef = useRef(pausedById);
  pausedByIdRef.current = pausedById;

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const c of campaigns) {
      if (toProto(c.status) === "scheduled") next[c.id] = c.paused ?? false;
    }
    setPausedById(next);
  }, [campaigns]);

  const statusFilters = useMemo(() => {
    const count = (f: StatusFilter) =>
      f === "all" ? campaigns.length : campaigns.filter((c) => toProto(c.status) === f).length;
    return [
      { id: "all" as const, label: "All", count: count("all") },
      { id: "active" as const, label: "Active", count: count("active") },
      { id: "scheduled" as const, label: "Scheduled", count: count("scheduled") },
      { id: "draft" as const, label: "Draft", count: count("draft") },
      { id: "completed" as const, label: "Completed", count: count("completed") },
    ];
  }, [campaigns]);

  const scheduledCount = useMemo(
    () => campaigns.filter((c) => toProto(c.status) === "scheduled").length,
    [campaigns],
  );

  /* Build rows enriched with proto fields */
  const tableRows = useMemo<CampaignRow[]>(() => {
    const q = search.trim().toLowerCase();
    return campaigns
      .filter((c) => {
        const p = toProto(c.status);
        const matchFilter = activeFilter === "all" || p === activeFilter;
        const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
        return matchFilter && matchSearch;
      })
      .map((c) => ({
        ...c,
        _protoStatus: toProto(c.status),
        _pipeline: derivePipelineForRow(c),
        _paused: pausedById[c.id] ?? c.paused ?? false,
      }));
  }, [campaigns, activeFilter, search, pausedById]);

  /* selection helpers */
  const filteredAllSelected = useMemo(
    () => tableRows.length > 0 && tableRows.every((r) => selectedIds.has(r.id)),
    [tableRows, selectedIds],
  );
  const filteredAnySelected = useMemo(
    () => tableRows.some((r) => selectedIds.has(r.id)),
    [tableRows, selectedIds],
  );

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = filteredAnySelected && !filteredAllSelected;
  }, [filteredAnySelected, filteredAllSelected]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(tableRows.map((r) => r.id)) : new Set());
    },
    [tableRows],
  );

  const togglePause = useCallback((c: CampaignRow) => {
    if (c._protoStatus !== "scheduled") return;
    setPausedById((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingId(null);
    setModalForm(EMPTY_FORM);
  }, []);

  const openEdit = useCallback((c: CampaignListItem) => {
    setModalForm({ name: c.name, status: c.status, skus: c.skus, hardware: c.hardware.join(", "), initiator: c.initiator, scheduled_date: c.date });
    setEditingId(c.id);
    setModalMode("edit");
  }, []);

  const handleSave = useCallback(() => {
    if (!editingId || modalMode !== "edit") return;
    updateMutation.mutate({ id: editingId, form: modalForm }, { onSuccess: closeModal });
  }, [editingId, modalMode, modalForm, updateMutation, closeModal]);

  const confirmDelete = useCallback(
    (id: string) => {
      if (deleteBusyId) return;
      setDeleteBusyId(id);
      deleteMutation.mutate(id, { onSettled: () => setDeleteBusyId(null) });
    },
    [deleteBusyId, deleteMutation],
  );

  /* ── build tabulator columns from current state ── */
  const selectionRevision = useMemo(
    () => `${selectedIds.size}:${[...selectedIds].sort().join(",")}:${JSON.stringify(pausedById)}`,
    [selectedIds, pausedById],
  );

  const columns = useMemo<PrototypeTabulatorColumn<CampaignRow>[]>(() => [
    {
      title: `<input type="checkbox" data-proto-header-checkbox="true" aria-label="Select all campaigns" class="accent-purple-500 cursor-pointer" />`,
      field: "id",
      headerSort: false,
      hozAlign: "center",
      width: 40,
      minWidth: 40,
      frozen: true,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        const checked = selectedIds.has(r.id);
        return `<button type="button" data-proto-row-checkbox="true" data-row-id="${r.id}"
          aria-label="Select ${r.name}"
          class="inline-flex size-4 items-center justify-center rounded border transition-colors ${
            checked
              ? "border-ithina-purple bg-ithina-purple text-white"
              : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
          }">
          <svg class="size-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.216a1 1 0 111.415-1.415l4.036 4.036 6.543-6.546a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </button>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</div>`,
      field: "name",
      headerSort: true,
      hozAlign: "left",
      minWidth: 200,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return `<div class="py-0.5">
          <p class="text-sm font-semibold text-white leading-tight">${r.name}</p>
          <p class="text-[10px] font-mono text-slate-600 mt-0.5">${r.id}</p>
        </div>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Status</div>`,
      field: "_protoStatus",
      headerSort: true,
      hozAlign: "left",
      width: 130,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return statusCellHtml(r._protoStatus);
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Pipeline Stage</div>`,
      field: "_pipeline",
      headerSort: false,
      hozAlign: "left",
      minWidth: 220,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return `<div class="flex items-center gap-1 flex-wrap">${pipelineCellHtml(r._pipeline)}</div>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Hardware</div>`,
      field: "hardware",
      headerSort: false,
      hozAlign: "left",
      minWidth: 140,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return hardwareCellHtml(r.hardware);
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</div>`,
      field: "skus",
      sorter: "number",
      headerSort: true,
      hozAlign: "left",
      width: 70,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return `<span class="text-sm font-mono text-slate-400 tabular-nums">${r.skus}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Date</div>`,
      field: "date",
      headerSort: true,
      hozAlign: "left",
      width: 130,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return `<span class="text-xs text-slate-500 font-mono whitespace-nowrap">${r.date}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Initiator</div>`,
      field: "initiator",
      headerSort: true,
      hozAlign: "left",
      width: 140,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        return `<span class="text-xs text-slate-500">${r.initiator}</span>`;
      },
    },
    {
      title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">Actions</div>`,
      field: "id",
      headerSort: false,
      hozAlign: "right",
      width: 200,
      minWidth: 180,
      frozen: true,
      formatter: (cell) => {
        const r = cell.getData() as CampaignRow;
        const paused = pausedByIdRef.current[r.id] ?? false;
        let actions = "";

        if (r._protoStatus === "draft") {
          actions += `<button data-action="edit" class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            Edit
          </button>`;
        }

        if (r._protoStatus === "scheduled") {
          const pauseCls = paused
            ? "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20"
            : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/10";
          const pauseIcon = paused
            ? `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
            : `<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
          actions += `<button data-action="pause" class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all ${pauseCls}">
            ${pauseIcon}${paused ? "Resume" : "Pause"}
          </button>`;
        }

        actions += `<button data-action="history" class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          History
        </button>`;

        actions += `<button data-action="delete" class="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500 px-2 py-1.5 rounded-lg border border-rose-400/20 hover:border-rose-500 transition-all">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>`;

        return `<div class="flex items-center justify-end gap-1.5">${actions}</div>`;
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [selectionRevision]);

  const handleCellClick = useCallback(
    (e: MouseEvent, row: CampaignRow) => {
      const target = e.target as HTMLElement | null;

      const rowCheckbox = target?.closest?.("[data-proto-row-checkbox='true']") as HTMLElement | null;
      if (rowCheckbox) {
        toggleSelect(row.id);
        return;
      }

      const actionEl = target?.closest?.("[data-action]") as HTMLElement | null;
      if (!actionEl) return;
      const action = actionEl.getAttribute("data-action");

      if (action === "edit") openEdit(row);
      if (action === "pause") togglePause(row);
      if (action === "delete") confirmDelete(row.id);
      // history: no-op for now
    },
    [toggleSelect, openEdit, togglePause, confirmDelete],
  );

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <AlertTriangle className="size-10 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Failed to load campaigns</h3>
        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading campaigns..." className="flex-1" />;
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
          isSaving={updateMutation.isPending}
        />
      )}

      <div className="w-full h-full flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">

        {/* ── Toolbar ── */}
        <div className="shrink-0 px-7 pt-5 pb-4 flex items-center gap-3 border-b border-ithina-border/40">

          {/* Tab switcher */}
          <div className="flex bg-ithina-panel border border-ithina-border rounded-lg p-0.5 gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === "all" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <span className="w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full"><TabAllIcon /></span>
              All Campaigns
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scheduled")}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === "scheduled" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <span className="w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full"><TabScheduledIcon /></span>
              Scheduled
              <span className={cn(
                "ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                activeTab === "scheduled" ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
              )}>
                {scheduledCount}
              </span>
            </button>
          </div>

          {/* Status filter pills — only on All tab */}
          {activeTab === "all" && (
            <div className="flex gap-1">
              {statusFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                    activeFilter === f.id
                      ? "bg-ithina-purple/10 border-ithina-purple/40 text-ithina-purple"
                      : "border-ithina-border text-slate-500 hover:text-white hover:border-slate-500",
                  )}
                >
                  {f.label}
                  <span className="ml-1 text-[9px] opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Bulk actions — only on All tab */}
          {activeTab === "all" && (
            <div className="flex items-center gap-1.5">
              {selectedIds.size > 0 && (
                <span className="text-[10px] font-semibold text-ithina-purple bg-ithina-purple/10 px-2 py-1 rounded mr-1">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                type="button"
                disabled={selectedIds.size === 0}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded border transition-all",
                  selectedIds.size > 0
                    ? "text-amber-400 bg-amber-400/10 hover:bg-amber-500 hover:text-white border-amber-400/25 cursor-pointer"
                    : "text-slate-600 border-ithina-border/40 cursor-not-allowed opacity-40",
                )}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pause
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded border transition-all",
                  selectedIds.size > 0
                    ? "text-rose-400 hover:bg-rose-500 hover:text-white border-rose-400/20 cursor-pointer"
                    : "text-slate-600 border-ithina-border/40 cursor-not-allowed opacity-40",
                )}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          )}

          {/* Search — only on All tab */}
          {activeTab === "all" && (
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search…"
                aria-label="Search campaigns"
                className="bg-ithina-bg border border-ithina-border text-sm text-white rounded-lg pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-ithina-purple transition-colors"
              />
            </div>
          )}
        </div>

        {/* ── All Campaigns tab: PrototypeTabulator ── */}
        {activeTab === "all" && (
          <PrototypeTabulator<CampaignRow>
            columns={columns}
            data={tableRows}
            rowIdField="id"
            emptyMessage="No campaigns match the current filters"
            pagination
            pageSize={25}
            pageSizeSelector={[10, 25, 50, 100]}
            virtualDom={tableRows.length > 100}
            resizableColumns
            layout="fitColumns"
            tableHeight="100%"
            formatRevision={selectionRevision}
            headerCheckbox={{
              checked: filteredAllSelected,
              indeterminate: filteredAnySelected && !filteredAllSelected,
              onChange: toggleAll,
              selector: "[data-proto-header-checkbox='true']",
            }}
            onCellClick={handleCellClick}
            className="approval-queue-prototype border-none"
          />
        )}

        {/* ── Scheduled tab ── */}
        {activeTab === "scheduled" && <CampaignsScheduledTab />}
      </div>
    </>
  );
}
