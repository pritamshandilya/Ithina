import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import CampaignModal from "./components/campaign-modal";
import type { CampaignCreateForm, CampaignListItem, CampaignListStatus } from "@/types/campaigns";
import { useCampaignList, useDeleteCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { cn } from "@/lib/utils";

type ActiveTab = "all" | "scheduled";
type StatusFilter = "all" | "active" | "scheduled" | "draft" | "completed";

function toPrototypeStatus(status: CampaignListStatus): Exclude<StatusFilter, "all"> | "pending" {
  switch (status) {
    case "Active":
      return "active";
    case "Scheduled":
      return "scheduled";
    case "Completed":
      return "completed";
    case "Draft":
      return "draft";
    case "Rejected":
      return "pending";
    default:
      return "pending";
  }
}

function derivePipeline(status: CampaignListStatus): string[] {
  switch (status) {
    case "Active":
    case "Completed":
      return ["Data", "Design", "Guard Rails", "Scheduled", "Deployed"];
    case "Scheduled":
      return ["Data", "Design", "Guard Rails", "Scheduled"];
    case "Draft":
      return ["Data", "Design"];
    case "Rejected":
      return ["Data", "Design", "Guard Rails", "Approval"];
  }
}

function statusClass(status: ReturnType<typeof toPrototypeStatus>) {
  // Matches index_3.1.html prototype styling.
  switch (status) {
    case "active":
      return "text-ithina-purple border-ithina-purple/30 bg-ithina-purple/8";
    case "scheduled":
      return "text-amber-400 border-amber-400/30 bg-amber-400/8";
    case "completed":
      return "text-emerald-400 border-emerald-400/30 bg-emerald-400/8";
    case "draft":
      return "text-slate-400 border-slate-600/60 bg-white/4";
    case "pending":
      return "text-orange-400 border-orange-400/30 bg-orange-400/8";
  }
}

function pipelineStageClass(stage: string) {
  // Matches index_3.1.html prototype styling.
  switch (stage) {
    case "Deployed":
      return "text-emerald-400 font-semibold";
    case "Scheduled":
      return "text-amber-400 font-semibold";
    case "Approval":
      return "text-orange-400 font-semibold";
    case "Guard Rails":
      return "text-ithina-purple font-semibold";
    case "Design":
      return "text-blue-400 font-semibold";
    case "Data":
      return "text-slate-400 font-semibold";
    default:
      return "text-slate-400";
  }
}

const EMPTY_FORM: CampaignCreateForm = {
  name: "",
  status: "Draft",
  skus: 0,
  hardware: "",
  initiator: "",
  scheduled_date: "",
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}

function PauseIcon({ paused, className }: { paused: boolean; className?: string }) {
  if (paused) {
    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
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

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const c of campaigns) {
      const proto = toPrototypeStatus(c.status);
      if (proto === "scheduled") next[c.id] = c.paused ?? false;
    }
    setPausedById(next);
  }, [campaigns]);

  const statusFilters = useMemo(() => {
    const getCount = (proto: StatusFilter | "active" | "scheduled" | "draft" | "completed") => {
      const protoStatus = proto === "all" ? null : proto;
      if (!protoStatus) return campaigns.length;
      return campaigns.filter((c) => toPrototypeStatus(c.status) === protoStatus).length;
    };

    return [
      { id: "all" as const, label: "All", count: getCount("all") },
      { id: "active" as const, label: "Active", count: getCount("active") },
      { id: "scheduled" as const, label: "Scheduled", count: getCount("scheduled") },
      { id: "draft" as const, label: "Draft", count: getCount("draft") },
      { id: "completed" as const, label: "Completed", count: getCount("completed") },
    ];
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const s = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const proto = toPrototypeStatus(c.status);
      const matchFilter = activeFilter === "all" || proto === activeFilter;
      const matchSearch =
        !s || c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s);
      return matchFilter && matchSearch;
    });
  }, [campaigns, activeFilter, search]);

  const filteredAllSelected = useMemo(() => {
    if (filteredCampaigns.length === 0) return false;
    return filteredCampaigns.every((c) => selectedIds.has(c.id));
  }, [filteredCampaigns, selectedIds]);

  const filteredAnySelected = useMemo(() => {
    return filteredCampaigns.some((c) => selectedIds.has(c.id));
  }, [filteredCampaigns, selectedIds]);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = filteredAnySelected && !filteredAllSelected;
  }, [filteredAnySelected, filteredAllSelected]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllCampaigns = useCallback((checked: boolean) => {
    setSelectedIds(() => {
      if (!checked) return new Set();
      const next = new Set<string>();
      for (const c of filteredCampaigns) next.add(c.id);
      return next;
    });
  }, [filteredCampaigns]);

  const togglePause = useCallback((c: CampaignListItem) => {
    const proto = toPrototypeStatus(c.status);
    if (proto === "completed" || proto === "active") return;
    if (proto !== "scheduled") return;
    setPausedById((prev) => ({ ...prev, [c.id]: !(prev[c.id] ?? c.paused ?? false) }));
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingId(null);
    setModalForm(EMPTY_FORM);
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

  const handleSave = useCallback(() => {
    if (!editingId || modalMode !== "edit") return;
    updateMutation.mutate(
      { id: editingId, form: modalForm },
      { onSuccess: closeModal },
    );
  }, [editingId, modalMode, modalForm, updateMutation, closeModal]);

  const confirmDelete = useCallback(
    async (id: string) => {
      if (deleteBusyId) return;
      setDeleteBusyId(id);
      try {
        deleteMutation.mutate(id);
      } finally {
        // mutation invalidates the query; clear busy quickly for UI responsiveness
        setDeleteBusyId(null);
      }
    },
    [deleteBusyId, deleteMutation],
  );

  const handleBulkPause = useCallback(() => {
    for (const id of selectedIds) {
      const c = campaigns.find((x) => x.id === id);
      if (c) togglePause(c);
    }
  }, [campaigns, selectedIds, togglePause]);

  const handleBulkDelete = useCallback(() => {
    for (const id of selectedIds) deleteMutation.mutate(id);
    setSelectedIds(new Set());
  }, [deleteMutation, selectedIds]);

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
        {/* Toolbar */}
        <div className="shrink-0 px-7 pt-5 pb-4 flex items-center gap-3 border-b border-ithina-border/40">
          {/* Tab switcher */}
          <div className="flex bg-ithina-panel border border-ithina-border rounded-lg p-0.5 gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              aria-current={activeTab === "all"}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === "all" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <span className="w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                <TabAllIcon />
              </span>
              All Campaigns
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("scheduled")}
              aria-current={activeTab === "scheduled"}
              className={cn(
                "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                activeTab === "scheduled" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <span className="w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full">
                <TabScheduledIcon />
              </span>
              Scheduled
              <span
                className={cn(
                  "ml-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                  activeTab === "scheduled" ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
                )}
              >
                {campaigns.filter((c) => toPrototypeStatus(c.status) === "scheduled").length}
              </span>
            </button>
          </div>

          {/* Status filter pills — only on All tab */}
          {activeTab === "all" && (
            <div className="flex gap-1">
              {statusFilters.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      isActive
                        ? "bg-ithina-purple/10 border-ithina-purple/40 text-ithina-purple"
                        : "border-ithina-border text-slate-500 hover:text-white hover:border-slate-500",
                    )}
                    aria-pressed={isActive}
                  >
                    {f.label}
                    <span className="ml-1 text-[9px] opacity-60">{f.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex-1" />

          {/* Bulk action buttons — only on All tab */}
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
                    : "text-slate-600 bg-transparent border-ithina-border/40 cursor-not-allowed opacity-40",
                )}
                onClick={handleBulkPause}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                    : "text-slate-600 bg-transparent border-ithina-border/40 cursor-not-allowed opacity-40",
                )}
                onClick={handleBulkDelete}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          )}

          {/* Search — only on All tab */}
          {activeTab === "all" && (
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search…"
                className="bg-ithina-bg border border-ithina-border text-sm text-white rounded-lg pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-ithina-purple transition-colors"
                aria-label="Search campaigns"
              />
            </div>
          )}
        </div>

        {/* TAB: ALL CAMPAIGNS */}
        {activeTab === "all" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-ithina-sidebar/95 backdrop-blur-sm border-b border-ithina-border">
                  <tr>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono w-8">
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        className="accent-purple-500 cursor-pointer"
                        checked={filteredAllSelected}
                        onChange={(e) => toggleAllCampaigns(e.target.checked)}
                        aria-label="Select all campaigns"
                      />
                    </th>
                    <th className="px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Status</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Pipeline Stage</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Hardware</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Initiator</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ithina-border/40">
                  {filteredCampaigns.map((c) => {
                    const protoStatus = toPrototypeStatus(c.status);
                    const pipeline = c.pipeline ?? derivePipeline(c.status);
                    const paused = pausedById[c.id] ?? c.paused ?? false;

                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          "hover:bg-white/[0.018] transition-colors group",
                          selectedIds.has(c.id) && "bg-ithina-purple/[0.04]",
                        )}
                      >
                        <td className="px-5 py-3">
                          <input
                            type="checkbox"
                            className="accent-purple-500 cursor-pointer"
                            checked={selectedIds.has(c.id)}
                            onChange={() => toggleSelect(c.id)}
                            aria-label={`Select campaign ${c.name}`}
                          />
                        </td>

                        <td className="px-3 py-3 min-w-[200px]">
                          <p className="text-sm font-semibold text-white leading-tight">{c.name}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-0.5">{c.id}</p>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold px-2 py-1 rounded-md border",
                              statusClass(protoStatus),
                            )}
                          >
                            {protoStatus === "active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
                            )}
                            {protoStatus.charAt(0).toUpperCase() + protoStatus.slice(1)}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {pipeline.flatMap((stage, si) => [
                              <span
                                key={`${c.id}-stage-${si}`}
                                className={si === pipeline.length - 1 ? pipelineStageClass(stage) : "text-slate-600 line-through"}
                              >
                                {stage}
                              </span>,
                              ...(si < pipeline.length - 1
                                ? [
                                    <ChevronRightIcon
                                      key={`${c.id}-sep-${si}`}
                                      className="w-2.5 h-2.5 text-slate-700 shrink-0"
                                    />,
                                  ]
                                : []),
                            ])}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {c.hardware.map((hw) => (
                              <span
                                key={`${c.id}-${hw}`}
                                className={cn(
                                  "text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border",
                                  hw.startsWith("ESL")
                                    ? "bg-blue-400/8 border-blue-400/20 text-blue-300"
                                    : "bg-amber-400/8 border-amber-400/20 text-amber-300",
                                )}
                              >
                                {hw}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm font-mono text-slate-400 tabular-nums">{c.skus}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{c.date}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{c.initiator}</td>

                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit: only for draft */}
                            {protoStatus === "draft" && (
                              <button
                                type="button"
                                onClick={() => openEdit(c)}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap"
                              >
                                <EditIcon className="w-3 h-3" />
                                Edit
                              </button>
                            )}

                            {/* Pause: only for scheduled */}
                            {protoStatus === "scheduled" && (
                              <button
                                type="button"
                                onClick={() => togglePause(c)}
                                className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all",
                                  paused
                                    ? "text-amber-400 bg-amber-400/10 border-amber-400/30 hover:bg-amber-400/20"
                                    : "text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/10",
                                )}
                              >
                                <PauseIcon paused={paused} className="w-3 h-3" />
                                {paused ? "Resume" : "Pause"}
                              </button>
                            )}

                            {/* History button (always visible) */}
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] px-2 py-1.5 rounded-lg border border-white/10 transition-all whitespace-nowrap"
                              onClick={() => {
                                // UI parity: prototype opens a history drawer.
                              }}
                            >
                              <HistoryIcon className="w-3 h-3" />
                              History
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-white hover:bg-rose-500 px-2 py-1.5 rounded-lg border border-rose-400/20 hover:border-rose-500 transition-all"
                              onClick={() => confirmDelete(c.id)}
                              disabled={deleteBusyId === c.id}
                              aria-label={`Delete ${c.name}`}
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table footer */}
            <div className="shrink-0 px-6 py-2.5 border-t border-ithina-border/40 bg-ithina-bg/40 flex items-center justify-between text-xs text-slate-600">
              <span className="font-mono">
                {filteredCampaigns.length} campaigns
                {selectedIds.size > 0 && (
                  <span className="text-ithina-purple ml-2">· {selectedIds.size} selected</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  &larr; Prev
                </button>
                <span className="font-mono px-2 py-1 bg-ithina-purple/10 text-ithina-purple rounded border border-ithina-purple/20">
                  1
                </span>
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SCHEDULED (placeholder to keep layout stable; exact calendar rendering can follow) */}
        {activeTab === "scheduled" && (
          <div className="flex-1 flex gap-0 min-h-0 overflow-hidden">
            <div className="w-64 shrink-0 border-r border-ithina-border/40 flex flex-col">
              <div className="p-4 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-white">March 2026</span>
                  <div className="flex gap-1">
                    <button className="px-2 py-0.5 text-[9px] font-mono font-semibold text-ithina-purple bg-ithina-purple/10 border border-ithina-purple/25 rounded transition-colors hover:bg-ithina-purple/20" type="button">
                      Today
                    </button>
                    <button className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors" type="button" aria-label="Previous day">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="p-1 text-slate-500 hover:text-white border border-ithina-border/60 rounded-md transition-colors" type="button" aria-label="Next day">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} className="aspect-square flex items-center justify-center rounded-md text-[10px] font-mono text-slate-600 bg-white/[0.01]">
                      {i + 1}
                    </div>
                  ))}
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
                    Upcoming · {campaigns.filter((c) => toPrototypeStatus(c.status) === "scheduled").length} deployment
                    {campaigns.filter((c) => toPrototypeStatus(c.status) === "scheduled").length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-600">Scheduled campaigns view is being matched to the prototype.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

