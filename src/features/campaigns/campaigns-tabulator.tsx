import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, LayoutList, Pause, Search, Trash2 } from "lucide-react";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { PrototypeTabulator } from "@/components/ui/prototype-tabulator";
import { cn } from "@/lib/utils";
import type { CampaignCreateForm, CampaignListItem } from "@/types/campaigns";
import { useCampaignList, useDeleteCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";

import CampaignModal from "./components/campaign-modal";
import CampaignsScheduledTab from "./campaigns-scheduled-tab";
import { buildCampaignTabulatorColumns, toPrototypeStatus } from "./campaigns-tabulator-columns";

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

export default function CampaignsTabulator() {
  const { data: campaigns = [], isLoading, isError } = useCampaignList();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [pausedById, setPausedById] = useState<Record<string, boolean>>({});

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const proto = toPrototypeStatus(c.status);
      const matchFilter = activeFilter === "all" ? true : proto === activeFilter;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [campaigns, activeFilter, search]);

  const allSelected = useMemo(() => {
    if (filteredCampaigns.length === 0) return false;
    return filteredCampaigns.every((c) => selectedIds.has(c.id));
  }, [filteredCampaigns, selectedIds]);

  const anySelected = useMemo(() => filteredCampaigns.some((c) => selectedIds.has(c.id)), [filteredCampaigns, selectedIds]);

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const c of campaigns) {
      const proto = toPrototypeStatus(c.status);
      if (proto === "scheduled") next[c.id] = c.paused ?? false;
    }
    setPausedById(next);
  }, [campaigns]);

  const statusFilters = useMemo(() => {
    const count = (proto: StatusFilter) => {
      if (proto === "all") return campaigns.length;
      return campaigns.filter((c) => toPrototypeStatus(c.status) === proto).length;
    };
    return [
      { id: "all" as const, label: "All", count: count("all") },
      { id: "active" as const, label: "Active", count: count("active") },
      { id: "scheduled" as const, label: "Scheduled", count: count("scheduled") },
      { id: "draft" as const, label: "Draft", count: count("draft") },
      { id: "completed" as const, label: "Completed", count: count("completed") },
    ];
  }, [campaigns]);

  const scheduledCount = useMemo(
    () => campaigns.filter((c) => toPrototypeStatus(c.status) === "scheduled").length,
    [campaigns],
  );

  const formatRevision = useMemo(
    () => `${[...selectedIds].sort().join(",")}|${JSON.stringify(pausedById)}`,
    [selectedIds, pausedById],
  );

  const columns = useMemo(
    () => buildCampaignTabulatorColumns({ selectedIds, pausedById }),
    [selectedIds, pausedById],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllCampaigns = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set());
        return;
      }
      setSelectedIds(new Set(filteredCampaigns.map((c) => c.id)));
    },
    [filteredCampaigns],
  );

  const togglePause = useCallback((c: CampaignListItem) => {
    const proto = toPrototypeStatus(c.status);
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
    if (modalMode !== "edit" || !editingId) return;
    updateMutation.mutate({ id: editingId, form: modalForm }, { onSuccess: closeModal });
  }, [modalForm, modalMode, editingId, updateMutation, closeModal]);

  const confirmDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    [deleteMutation],
  );

  const bulkPause = useCallback(() => {
    for (const id of selectedIds) {
      const c = campaigns.find((x) => x.id === id);
      if (c) togglePause(c);
    }
  }, [campaigns, selectedIds, togglePause]);

  const bulkDelete = useCallback(() => {
    for (const id of selectedIds) deleteMutation.mutate(id);
    setSelectedIds(new Set());
  }, [deleteMutation, selectedIds]);

  const onCellClick = useCallback(
    (e: MouseEvent, row: CampaignListItem) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const checkbox = target.closest?.("[data-proto-row-select='true']") as HTMLElement | null;
      if (checkbox) {
        toggleSelect(row.id);
        return;
      }

      const actionEl = target.closest?.("[data-action]") as HTMLElement | null;
      const action = actionEl?.getAttribute("data-action");
      if (!action) return;

      if (action === "edit") openEdit(row);
      if (action === "pause") togglePause(row);
      if (action === "history") {
        /* prototype */
      }
      if (action === "delete") confirmDelete(row.id);
    },
    [confirmDelete, openEdit, togglePause, toggleSelect],
  );

  const rowFormatter = useCallback((row: CampaignListItem, el: HTMLElement) => {
    el.classList.toggle("campaigns-row-selected", selectedIds.has(row.id));
  }, [selectedIds]);

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <div className="text-rose-400 text-sm font-semibold">Failed to load campaigns</div>
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

      <div className="flex h-full w-full flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border/40 px-7 pb-4 pt-5">
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
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  activeTab === "scheduled" ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
                )}
              >
                {scheduledCount}
              </span>
            </button>
          </div>

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
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                      isActive
                        ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                        : "border-ithina-border text-slate-500 hover:border-slate-500 hover:text-white",
                    )}
                  >
                    {f.label}
                    <span className="ml-1 text-[9px] opacity-60">{f.count}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex-1" />

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
                    ? "cursor-pointer border-amber-400/25 bg-amber-400/10 text-amber-400 hover:bg-amber-500 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 bg-transparent text-slate-600 opacity-40",
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
                    ? "cursor-pointer border-rose-400/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 bg-transparent text-slate-600 opacity-40",
                )}
              >
                <Trash2 className="size-3" aria-hidden />
                Delete
              </button>
            </div>
          )}

          {activeTab === "all" && (
            <div className="relative w-44 shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="search"
                placeholder="Search…"
                aria-label="Search campaigns"
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-8 pr-3 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
            </div>
          )}
        </div>

        {activeTab === "all" && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <PrototypeTabulator
                className="campaigns-tabulator-prototype min-h-0 flex-1 border-0"
                columns={columns}
                data={filteredCampaigns}
                formatRevision={formatRevision}
                layout="fitDataTable"
                rowFormatter={rowFormatter}
                tableHeight="100%"
                pagination={false}
                onCellClick={onCellClick}
                headerCheckbox={{
                  checked: allSelected,
                  indeterminate: anySelected && !allSelected,
                  onChange: toggleAllCampaigns,
                  selector: "[data-proto-header-checkbox='true']",
                }}
              />
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-ithina-border/40 bg-ithina-bg/40 px-6 py-2.5 text-xs text-slate-600">
              <span className="font-mono">
                {filteredCampaigns.length} campaigns
                {selectedIds.size > 0 ? (
                  <span className="ml-2 text-ithina-purple">· {selectedIds.size} selected</span>
                ) : null}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-ithina-border px-2.5 py-1 transition-colors hover:border-ithina-purple/50 hover:text-white"
                  aria-label="Previous page"
                  disabled
                >
                  ←
                </button>
                <span className="rounded border border-ithina-purple/20 bg-ithina-purple/10 px-2 py-1 font-mono text-ithina-purple">
                  1
                </span>
                <button
                  type="button"
                  className="rounded border border-ithina-border px-2.5 py-1 transition-colors hover:border-ithina-purple/50 hover:text-white"
                  aria-label="Next page"
                  disabled
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scheduled" && <CampaignsScheduledTab />}
      </div>
    </>
  );
}
