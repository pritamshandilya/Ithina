import { Calendar, LayoutList, Pause, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { IthTable } from "@/components/ui/ith-table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CampaignCreateForm, CampaignListItem } from "@/types/campaigns";
import { useCampaignList, useDeleteCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";

import CampaignHistoryModal from "./components/campaign-history-modal";
import CampaignModal from "./components/campaign-modal";
import CampaignsScheduledTab from "./campaigns-scheduled-tab";
import {
  buildCampaignColumns,
  canDeleteCampaignByStatus,
  toPrototypeStatus,
} from "./campaigns-tabulator-columns";

type ActiveTab = "all" | "scheduled";
type StatusFilter = "all" | "active" | "scheduled" | "draft" | "completed";

const EMPTY_FORM: CampaignCreateForm = {
  name: "",
  status: "Draft",
  skus: 0,
  hardware: "",
  initiator: "",
  scheduled_date: "",
};

const PAGE_SIZE = 15;

export default function CampaignsTabulator() {
  const { data: campaigns = [], isLoading, isError } = useCampaignList();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pausedById, setPausedById] = useState<Record<string, boolean>>({});

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyCampaign, setHistoryCampaign] = useState<CampaignListItem | null>(null);

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const proto = toPrototypeStatus(c.status);
      const matchFilter = activeFilter === "all" ? true : proto === activeFilter;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [campaigns, activeFilter, search]);

  const allSelected = useMemo(
    () => filteredCampaigns.length > 0 && filteredCampaigns.every((c) => selectedIds.has(c.id)),
    [filteredCampaigns, selectedIds],
  );
  const anySelected = useMemo(
    () => filteredCampaigns.some((c) => selectedIds.has(c.id)),
    [filteredCampaigns, selectedIds],
  );

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const c of campaigns) {
      if (toPrototypeStatus(c.status) === "scheduled") next[c.id] = c.paused ?? false;
    }
    setPausedById(next);
  }, [campaigns]);

  const statusFilters = useMemo(() => {
    const count = (proto: StatusFilter) =>
      proto === "all"
        ? campaigns.length
        : campaigns.filter((c) => toPrototypeStatus(c.status) === proto).length;
    return [
      { id: "all" as const,       label: "All",       count: count("all") },
      { id: "active" as const,    label: "Active",    count: count("active") },
      { id: "scheduled" as const, label: "Scheduled", count: count("scheduled") },
      { id: "draft" as const,     label: "Draft",     count: count("draft") },
      { id: "completed" as const, label: "Completed", count: count("completed") },
    ];
  }, [campaigns]);

  const scheduledCount = useMemo(
    () => campaigns.filter((c) => Boolean(c.scheduledAt)).length,
    [campaigns],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllCampaigns = useCallback(
    (checked: boolean) => {
      setSelectedIds(checked ? new Set(filteredCampaigns.map((c) => c.id)) : new Set());
    },
    [filteredCampaigns],
  );

  const togglePause = useCallback((c: CampaignListItem) => {
    if (toPrototypeStatus(c.status) !== "scheduled") return;
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
    if (modalMode !== "edit" || !editingId) return;
    updateMutation.mutate({ id: editingId, form: modalForm }, { onSuccess: closeModal });
  }, [modalForm, modalMode, editingId, updateMutation, closeModal]);

  const confirmDelete = useCallback(
    (id: string) => {
      const campaign = campaigns.find((c) => c.id === id);
      if (!campaign || !canDeleteCampaignByStatus(campaign.status)) {
        toast({
          title: "Delete not allowed",
          description: "Only Draft or Rejected campaigns can be deleted.",
          variant: "destructive",
        });
        return;
      }
      deleteMutation.mutate(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [campaigns, deleteMutation],
  );

  const bulkPause  = useCallback(() => {
    for (const id of selectedIds) {
      const c = campaigns.find((x) => x.id === id);
      if (c) togglePause(c);
    }
  }, [campaigns, selectedIds, togglePause]);

  const bulkDelete = useCallback(() => {
    let skippedCount = 0;
    for (const id of selectedIds) {
      const campaign = campaigns.find((x) => x.id === id);
      if (!campaign || !canDeleteCampaignByStatus(campaign.status)) {
        skippedCount += 1;
        continue;
      }
      deleteMutation.mutate(id);
    }
    if (skippedCount > 0) {
      toast({
        title: "Some campaigns skipped",
        description: `${skippedCount} selected campaign(s) were skipped. Only Draft or Rejected campaigns can be deleted.`,
        variant: "destructive",
      });
    }
    setSelectedIds(new Set());
  }, [campaigns, deleteMutation, selectedIds]);

  /* Row click — delegate to data-action / data-proto-row-select attributes */
  const handleRowClick = useCallback(
    (row: CampaignListItem, e: React.MouseEvent<HTMLTableRowElement>) => {
      const target = e.target as HTMLElement;

      const selectBtn = target.closest?.("[data-proto-row-select='true']");
      if (selectBtn) { toggleSelect(row.id); return; }

      const actionEl = target.closest?.("[data-action]") as HTMLElement | null;
      const action = actionEl?.getAttribute("data-action");
      if (!action) return;

      if (action === "edit")    openEdit(row);
      if (action === "pause")   togglePause(row);
      if (action === "history") setHistoryCampaign(row);
      if (action === "delete")  confirmDelete(row.id);
    },
    [confirmDelete, openEdit, togglePause, toggleSelect],
  );

  const columns = useMemo(
    () =>
      buildCampaignColumns({
        selectedIds,
        pausedById,
        allSelected,
        anySelected,
        onToggleAll: toggleAllCampaigns,
      }),
    [selectedIds, pausedById, allSelected, anySelected, toggleAllCampaigns],
  );

  /* Inject custom header checkbox into the select column */
  const columnsWithHeader = useMemo(
    () =>
      columns.map((col) =>
        col.key === "select"
          ? {
              ...col,
              headerRender: () => (
                <button
                  type="button"
                  aria-label="Select all campaigns"
                  onClick={(e) => { e.stopPropagation(); toggleAllCampaigns(!allSelected); }}
                  className={`inline-flex size-4 items-center justify-center rounded border transition-colors ${
                    allSelected
                      ? "border-ithina-purple bg-ithina-purple text-white"
                      : anySelected
                        ? "border-ithina-purple bg-ithina-purple/40 text-white"
                        : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
                  }`}
                >
                  <svg className="size-2.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.415 0L3.296 9.216a1 1 0 111.415-1.415l4.036 4.036 6.543-6.546a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              ),
            }
          : col,
      ),
    [columns, allSelected, anySelected, toggleAllCampaigns],
  );

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="text-sm font-semibold text-rose-400">Failed to load campaigns</p>
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
          mode={modalMode === "create" ? "create" : "edit"}
          form={modalForm}
          onChange={setModalForm}
          onSave={handleSave}
          onClose={closeModal}
          isSaving={updateMutation.isPending}
        />
      )}

      {historyCampaign && (
        <CampaignHistoryModal
          campaign={historyCampaign}
          onClose={() => setHistoryCampaign(null)}
        />
      )}

      <div className="flex h-full w-full flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">

        {/* ── Toolbar ── */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-ithina-border/40 px-7 pb-4 pt-5">

          {/* View tabs */}
          <div className="flex shrink-0 gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "all" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <LayoutList className="size-3.5 shrink-0" aria-hidden />
              All Campaigns
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("scheduled")}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                activeTab === "scheduled" ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              Scheduled
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  activeTab === "scheduled" ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
                )}
              >
                {scheduledCount}
              </span>
            </button>
          </div>

          {/* Status filters */}
          {activeTab === "all" && (
            <div className="flex flex-wrap gap-1">
              {statusFilters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setActiveFilter(f.id); setPage(1); }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    activeFilter === f.id
                      ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                      : "border-ithina-border text-slate-500 hover:border-slate-500 hover:text-white",
                  )}
                >
                  {f.label}
                  <span className="ml-1 text-[9px] opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex-1" />

          {/* Bulk actions + search */}
          {activeTab === "all" && (
            <div className="flex items-center gap-1.5">
              {selectedIds.size > 0 && (
                <span className="mr-1 rounded bg-ithina-purple/10 px-2 py-1 text-[10px] font-semibold text-ithina-purple">
                  {selectedIds.size} selected
                </span>
              )}

              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={bulkPause}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  selectedIds.size > 0
                    ? "border-amber-400/25 bg-amber-400/10 text-amber-400 hover:bg-amber-500 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
                )}
              >
                <Pause className="size-3" aria-hidden />
                Pause
              </button>

              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={bulkDelete}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  selectedIds.size > 0
                    ? "border-rose-400/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
                )}
              >
                <Trash2 className="size-3" aria-hidden />
                Delete
              </button>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" aria-hidden />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  type="search"
                  placeholder="Search…"
                  aria-label="Search campaigns"
                  className="w-44 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-8 pr-3 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {activeTab === "all" ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <IthTable<CampaignListItem>
              data={filteredCampaigns}
              columns={columnsWithHeader}
              rowKey={(r) => r.id}
              onRowClick={handleRowClick}
              rowHighlight={(row) =>
                selectedIds.has(row.id) ? "purple" : null
              }
              pagination={{
                page,
                pageSize: PAGE_SIZE,
                total: filteredCampaigns.length,
                onPageChange: setPage,
                rowLabel: "campaigns",
              }}
              empty={{ message: "No campaigns match your filter." }}
              className="rounded-none border-0 flex-1"
            />
          </div>
        ) : (
          <CampaignsScheduledTab />
        )}
      </div>
    </>
  );
}
