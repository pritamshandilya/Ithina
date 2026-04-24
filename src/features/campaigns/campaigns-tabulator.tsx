import { AlertCircle, Calendar, LayoutList, Pause, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { CampaignCreateForm, CampaignListItem } from "@/types/campaigns";
import { useCampaignList, useDeleteCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";

import CampaignDetailModal from "./components/campaign-detail-modal";
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
  const { data: campaigns = [], isLoading, isError, error } = useCampaignList();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const { toast } = useToast();

  // React Query's `useMutation` returns a NEW object on every render, while
  // `mutate` itself is a stable reference. Destructuring the functions keeps
  // the callbacks below referentially stable so the `columns` memo (and, in
  // turn, the Tabulator grid) doesn't rebuild on every parent re-render.
  const { mutate: updateCampaign } = updateMutation;
  const { mutate: deleteCampaign } = deleteMutation;

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [selectedRows, setSelectedRows] = useState<CampaignListItem[]>([]);
  const selectedIds = useMemo(() => new Set(selectedRows.map((r) => r.id)), [selectedRows]);

  const [pausedById, setPausedById] = useState<Record<string, boolean>>({});

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<CampaignCreateForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyCampaign, setHistoryCampaign] = useState<CampaignListItem | null>(null);
  const [detailCampaignId, setDetailCampaignId] = useState<string | null>(null);

  // Stable refs so column formatters (recreated on pausedById change) don't capture stale closures.
  const pausedByIdRef = useRef(pausedById);
  pausedByIdRef.current = pausedById;

  const filteredCampaigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      const proto = toPrototypeStatus(c.status);
      const matchFilter = activeFilter === "all" ? true : proto === activeFilter;
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [campaigns, activeFilter, search]);

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

  const togglePause = useCallback((c: CampaignListItem) => {
    if (toPrototypeStatus(c.status) !== "scheduled") return;
    setPausedById((prev) => ({ ...prev, [c.id]: !(prev[c.id] ?? c.paused ?? false) }));
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setEditingId(null);
    setModalForm(EMPTY_FORM);
  }, []);

  const openCampaignDetail = useCallback((c: CampaignListItem) => {
    setDetailCampaignId(c.id);
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
    updateCampaign({ id: editingId, form: modalForm }, { onSuccess: closeModal });
  }, [modalForm, modalMode, editingId, updateCampaign, closeModal]);

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
      deleteCampaign(id);
      setSelectedRows((prev) => prev.filter((r) => r.id !== id));
    },
    [campaigns, deleteCampaign, toast],
  );

  const bulkPause = useCallback(() => {
    let pausedCount = 0;
    let skippedCount = 0;
    for (const row of selectedRows) {
      if (toPrototypeStatus(row.status) === "scheduled") {
        togglePause(row);
        pausedCount++;
      } else {
        skippedCount++;
      }
    }
    if (skippedCount > 0) {
      toast({
        title: pausedCount > 0 ? "Some campaigns skipped" : "No campaigns paused",
        description: `${skippedCount} selected campaign(s) were skipped. Only Scheduled campaigns can be paused.`,
        variant: "destructive",
      });
    }
  }, [selectedRows, togglePause, toast]);

  const bulkDelete = useCallback(() => {
    let skippedCount = 0;
    for (const row of selectedRows) {
      if (!canDeleteCampaignByStatus(row.status)) { skippedCount++; continue; }
      deleteCampaign(row.id);
    }
    if (skippedCount > 0) {
      toast({
        title: "Some campaigns skipped",
        description: `${skippedCount} selected campaign(s) were skipped. Only Draft or Rejected campaigns can be deleted.`,
        variant: "destructive",
      });
    }
    setSelectedRows([]);
  }, [selectedRows, deleteCampaign, toast]);

  const columns = useMemo(
    () =>
      buildCampaignColumns({
        pausedById,
        onView: openCampaignDetail,
        onEdit: openEdit,
        onPause: togglePause,
        onHistory: setHistoryCampaign,
        onDelete: confirmDelete,
      }),
    [pausedById, openCampaignDetail, openEdit, togglePause, confirmDelete],
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-ithina-bg">
      {detailCampaignId && (
        <CampaignDetailModal
          campaignId={detailCampaignId}
          onClose={() => setDetailCampaignId(null)}
        />
      )}

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

      <div className="ithina-page flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 px-4 pb-4 pt-2 lg:px-8">
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div className="flex shrink-0 gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel/80 p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                  activeTab === "all"
                    ? "bg-ithina-purple text-white shadow-sm"
                    : "text-slate-400 hover:text-white",
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
                  activeTab === "scheduled"
                    ? "bg-ithina-purple text-white shadow-sm"
                    : "text-slate-400 hover:text-white",
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

            {activeTab === "all" && (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                {statusFilters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={cn(
                      "h-8 rounded-md border px-2.5 text-xs font-medium transition-all",
                      activeFilter === f.id
                        ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                        : "border-ithina-border/60 text-slate-500 hover:border-slate-500 hover:text-white",
                    )}
                  >
                    {f.label}
                    <span className="ml-1 text-[9px] tabular-nums opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "all" && (
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {selectedIds.size > 0 && (
                  <span className="mr-0.5 rounded bg-ithina-purple/10 px-2 py-1 text-[10px] font-semibold text-ithina-purple">
                    {selectedIds.size} selected
                  </span>
                )}

                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={bulkPause}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-all",
                    selectedIds.size > 0
                      ? "border-amber-400/25 bg-amber-400/10 text-amber-300 hover:bg-amber-500 hover:text-white"
                      : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
                  )}
                >
                  <Pause className="size-3.5" aria-hidden />
                  Pause
                </button>

                <button
                  type="button"
                  disabled={selectedIds.size === 0}
                  onClick={bulkDelete}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-all",
                    selectedIds.size > 0
                      ? "border-rose-400/25 text-rose-300 hover:bg-rose-500 hover:text-white"
                      : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
                  )}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </button>
              </div>
            )}
          </div>

          {activeTab === "all" && (
            <div className="group relative shrink-0">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                className="h-12 w-full rounded-md border border-input bg-card py-2 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
                aria-label="Search campaigns"
              />
            </div>
          )}

          {isLoading && (
            <div className="shrink-0 space-y-3 rounded-xl border border-ithina-border/40 bg-ithina-panel/20 p-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full rounded-md" />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 py-4 text-rose-300"
              role="alert"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span className="text-sm">
                {(error as Error)?.message ?? "Failed to load campaigns"}
              </span>
            </div>
          )}

          {!isLoading && !isError && activeTab === "all" && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <DataTable<CampaignListItem>
                data={filteredCampaigns}
                columns={columns}
                rowIdField="id"
                isBulkEnabled
                onSelectionChange={setSelectedRows}
                onRowClick={openCampaignDetail}
                pagination
                pageSize={PAGE_SIZE}
                pageSizeSelector={[5, 10, 15, 20, 50]}
                emptyMessage="No campaigns match your filter."
                headerFilters
                className="min-h-0 flex-1"
              />
            </div>
          )}

          {!isLoading && !isError && activeTab === "scheduled" && (
            <div className="min-h-0 min-w-0 flex-1">
              <CampaignsScheduledTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
