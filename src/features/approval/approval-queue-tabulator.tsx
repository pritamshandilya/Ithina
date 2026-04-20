/**
 * ApprovalQueueTabulator — redesigned with IthTable (native HTML table).
 * Three tabs: Pending Approval · Approved · All
 * Design: Ithina Design System §2.4 + screenshots.
 */

import { AlertTriangle, Check, Clock, Loader2, Search, X, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { ApprovalPublishWatcher } from "@/features/approval/approval-publish-watcher";
import { getSubmittedVariantId } from "@/features/campaign-studio/types";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";
import { useApproveInboxItem, useInboxItems, useRejectInboxItem } from "@/hooks/use-approval";
import { campaignKeys, useCampaignList, useCampaignTimeline } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types/approval";

/* ─── Local types ─────────────────────────────────────────────────────────── */

type TabId = "pending" | "approved" | "all";

interface ApprovedRow {
  id: string;
  title: string;
  approvedBy: string;
  skus: number;
  hardware: string[];
  approvedAt: string;
  status: "Deployed" | "Scheduled";
}

interface AllRow {
  id: string;
  title: string;
  initiator: string;
  skus: number;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  guardRails: "Pass" | "1 warning" | "2 warnings";
  date: string;
}

/* ─── Hardware pills ─────────────────────────────────────────────────────── */

function HardwarePills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((hw) => {
        const cls = hw.startsWith("ESL")
          ? "bg-blue-400/10 border-blue-400/20 text-blue-300"
          : "bg-amber-400/10 border-amber-400/20 text-amber-300";
        return (
          <span key={hw} className={`rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium ${cls}`}>
            {hw}
          </span>
        );
      })}
    </div>
  );
}

/* ─── Guard rails badge ─────────────────────────────────────────────────── */

function GuardRailsBadge({
  label,
  variant,
}: {
  label: string;
  variant: "success" | "warning";
}) {
  return variant === "success" ? (
    <span className="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
      <Check className="size-2.5 shrink-0" strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
      <AlertTriangle className="size-2.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}

/* ─── Submitted variant badge ────────────────────────────────────────────── */

/**
 * Lazily loads the campaign timeline (React-Query cached) and shows the
 * variant letter that the Maker selected before submitting for approval.
 */
function VariantBadge({ campaignId }: { campaignId: string }) {
  const { data: events = [] } = useCampaignTimeline(campaignId);
  const variantId = getSubmittedVariantId(events);
  if (!variantId) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 px-2 py-0.5 font-mono text-[10px] text-ithina-purple">
      Variant {variantId}
    </span>
  );
}

/* ─── Checkbox cell & header ─────────────────────────────────────────────── */

function CheckboxCell({
  checked,
  label,
  dataAttr,
}: {
  checked: boolean;
  label: string;
  dataAttr: string;
}) {
  return (
    <button
      type="button"
      {...{ [dataAttr]: "true" }}
      aria-label={label}
      className={`inline-flex size-4 items-center justify-center rounded border transition-colors ${
        checked
          ? "border-ithina-purple bg-ithina-purple text-white"
          : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
      }`}
    >
      <Check className="size-2.5" strokeWidth={3} aria-hidden />
    </button>
  );
}

/* Mock data arrays removed — all tabs use real campaign data from API. */

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ApprovalQueueTabulator() {
  const { data: inbox = [], isLoading, isError } = useInboxItems();
  const { data: campaigns = [] } = useCampaignList();
  const approveMutation = useApproveInboxItem();
  const rejectMutation = useRejectInboxItem();

  const navigate = useNavigate();
  const qc = useQueryClient();

  const [tab, setTab]       = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  /** Set of campaign IDs currently being polled for `campaign_published`. */
  const [publishWatchIds, setPublishWatchIds] = useState<Set<string>>(() => new Set());

  /* Pending tab selection */
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(() => new Set());
  /* All tab selection */
  const [allSelectedIds, setAllSelectedIds] = useState<Set<string>>(() => new Set());

  /* ── Pending tab ── */

  const pendingCount = useMemo(() => inbox.filter((i) => i.status === "pending").length, [inbox]);

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inbox.filter((i) => {
      const matchSearch = !q || i.title.toLowerCase().includes(q) || i.initiator.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
      return i.status === "pending" && matchSearch;
    });
  }, [inbox, search]);

  const pendingAllSelected = useMemo(
    () => filteredPending.length > 0 && filteredPending.every((i) => selectedIds.has(i.id)),
    [filteredPending, selectedIds],
  );
  const pendingAnySelected = useMemo(
    () => filteredPending.some((i) => selectedIds.has(i.id)),
    [filteredPending, selectedIds],
  );

  const togglePendingSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllPending = useCallback(
    (checked: boolean) =>
      setSelectedIds(checked ? new Set(filteredPending.map((i) => i.id)) : new Set()),
    [filteredPending],
  );

  /**
   * Read the submitted variant id from the React-Query timeline cache (already
   * populated by VariantBadge). Avoids a redundant GET /events on approve.
   */
  const getCachedVariant = useCallback(
    (campaignId: string): string | undefined =>
      getSubmittedVariantId(
        qc.getQueryData<ApiCampaignEventResponse[]>(
          campaignKeys.timeline(campaignId),
        ) ?? [],
      ) ?? undefined,
    [qc],
  );

  const bulkApprove = useCallback(() => {
    const pendingItems = filteredPending.filter((i) => selectedIds.has(i.id));
    pendingItems.forEach((item) => {
      if (!item.id) {
        toast({ title: "Cannot approve", description: "Campaign ID is missing.", variant: "destructive" });
        return;
      }
      approveMutation.mutate(
        { id: item.id, scheduleType: item.scheduleType, selectedVariantId: getCachedVariant(item.id) },
        {
          onSuccess: () =>
            setPublishWatchIds((prev) => new Set([...prev, item.id])),
        },
      );
    });
    setSelectedIds(new Set());
  }, [approveMutation, filteredPending, getCachedVariant, selectedIds]);

  const bulkReject = useCallback(() => {
    selectedIds.forEach((id) => rejectMutation.mutate(id));
    setSelectedIds(new Set());
  }, [rejectMutation, selectedIds]);

  const handlePendingRowClick = useCallback(
    (row: InboxItem, e: React.MouseEvent<HTMLTableRowElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest?.("[data-proto-row-checkbox='true']")) { togglePendingSelect(row.id); return; }

      const actionEl = target.closest?.("[data-action]") as HTMLElement | null;
      const action = actionEl?.getAttribute("data-action");
      if (!action) return;

      if (!row.id) {
        toast({ title: "Cannot perform action", description: "Campaign ID is missing.", variant: "destructive" });
        return;
      }

      if (action === "approve") {
        approveMutation.mutate(
          { id: row.id, scheduleType: row.scheduleType, selectedVariantId: getCachedVariant(row.id) },
          {
            onSuccess: () =>
              setPublishWatchIds((prev) => new Set([...prev, row.id])),
          },
        );
      }
      if (action === "approve-live") {
        approveMutation.mutate(
          { id: row.id, scheduleType: row.scheduleType, selectedVariantId: getCachedVariant(row.id) },
          {
            onSuccess: () => {
              setPublishWatchIds((prev) => new Set([...prev, row.id]));
              toast({
                title: "Approved & publishing",
                description:
                  "We'll notify you when batch render completes (campaign published).",
              });
            },
          },
        );
      }
      if (action === "reject") {
        rejectMutation.mutate(row.id);
      }
      if (action === "history") {
        void navigate({
          to: "/maker/campaign/$campaignId/studio",
          params: { campaignId: row.id },
        });
      }
    },
    [approveMutation, getCachedVariant, rejectMutation, togglePendingSelect, navigate],
  );

  /* ── All tab ── */

  const filteredAll = useMemo(() => {
    const q = search.trim().toLowerCase();
    const allRowsFromCampaigns: AllRow[] = campaigns.map((c) => ({
      id: c.id,
      title: c.name,
      initiator: c.ownerName ?? c.initiator,
      skus: c.skus,
      approvalStatus:
        c.approvalStatus === "approved"
          ? "Approved"
          : c.approvalStatus === "rejected"
            ? "Rejected"
            : "Pending",
      guardRails: "Pass",
      date: c.date,
    }));
    return allRowsFromCampaigns.filter((r) => !q || r.title.toLowerCase().includes(q) || r.initiator.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [campaigns, search]);

  const allTabAllSelected = useMemo(
    () => filteredAll.length > 0 && filteredAll.every((r) => allSelectedIds.has(r.id)),
    [filteredAll, allSelectedIds],
  );
  const allTabAnySelected = useMemo(() => filteredAll.some((r) => allSelectedIds.has(r.id)), [filteredAll, allSelectedIds]);

  const toggleAllTabSelect = useCallback((id: string) => {
    setAllSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAllInAllTab = useCallback(
    (checked: boolean) =>
      setAllSelectedIds(checked ? new Set(filteredAll.map((r) => r.id)) : new Set()),
    [filteredAll],
  );

  /* ── Approved tab ── */

  const filteredApproved = useMemo(() => {
    const q = search.trim().toLowerCase();
    const approvedRowsFromCampaigns: ApprovedRow[] =
      campaigns.filter((c) => c.approvalStatus === "approved").map((c) => ({
        id: c.id,
        title: c.name,
        approvedBy: c.reviewedByName ?? "Checker",
        skus: c.skus,
        hardware: c.hardware,
        approvedAt: c.reviewedAt ?? c.date,
        status: "Deployed",
      }));
    return approvedRowsFromCampaigns.filter((r) => !q || r.title.toLowerCase().includes(q) || r.approvedBy.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [campaigns, search]);

  /* ── Column definitions ── */

  const pendingColumns = useMemo<IthColumnDef<InboxItem>[]>(
    () => [
      {
        key: "select",
        label: "",
        width: "w-[44px]",
        align: "center",
        headerRender: () => (
          <button
            type="button"
            aria-label="Select all pending"
            onClick={(e) => { e.stopPropagation(); toggleAllPending(!pendingAllSelected); }}
            className={`inline-flex size-4 items-center justify-center rounded border transition-colors ${
              pendingAllSelected
                ? "border-ithina-purple bg-ithina-purple text-white"
                : pendingAnySelected
                  ? "border-ithina-purple bg-ithina-purple/40 text-white"
                  : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
            }`}
          >
            <Check className="size-2.5" strokeWidth={3} aria-hidden />
          </button>
        ),
        render: (row) => (
          <CheckboxCell
            checked={selectedIds.has(row.id)}
            label={`Select ${row.title}`}
            dataAttr="data-proto-row-checkbox"
          />
        ),
      },
      {
        key: "campaign",
        label: "Campaign",
        sortable: true,
        render: (row) => (
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold leading-tight text-white">{row.title}</p>
              {row.urgent && (
                <span className="rounded border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-400">
                  Expires 48H
                </span>
              )}
              <VariantBadge campaignId={row.id} />
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-slate-400">{row.id}</p>
            {row.subtitle && <p className="mt-0.5 font-mono text-[10px] text-slate-500">{row.subtitle}</p>}
          </div>
        ),
      },
      {
        key: "initiator",
        label: "Submitted By",
        width: "w-[140px]",
        render: (row) => <span className="text-xs text-slate-400">{row.initiator}</span>,
      },
      {
        key: "skus",
        label: "SKUs",
        width: "w-[72px]",
        render: (row) => <span className="font-mono text-sm tabular-nums text-slate-400">{row.skus}</span>,
      },
      {
        key: "hardware",
        label: "Hardware",
        width: "w-[180px]",
        render: (row) => <HardwarePills items={row.hardwareTargets ?? []} />,
      },
      {
        key: "guardRails",
        label: "Guard Rails",
        width: "w-[140px]",
        render: (row) => (
          <GuardRailsBadge
            label={row.guardRailsLabel ?? (row.metaVariant === "success" ? "All Pass" : row.meta)}
            variant={row.metaVariant === "success" ? "success" : "warning"}
          />
        ),
      },
      {
        key: "submittedAt",
        label: "Submitted",
        width: "w-[160px]",
        render: (row) => (
          <span className="whitespace-nowrap font-mono text-xs text-slate-500">
            {row.submittedAt ?? row.meta}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "min-w-[300px] w-[320px]",
        render: (row) =>
          row.apiStatus === "publishing" ? (
            /* Campaign is already approved and being batch-rendered — no actions */
            <div className="flex items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-3 py-1.5 font-mono text-[10px] text-amber-400">
                <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden />
                Batch rendering…
              </span>
              <button
                type="button"
                data-action="history"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <Clock className="size-3 shrink-0" aria-hidden />
                View
              </button>
            </div>
          ) : (
            <div className="flex max-w-[320px] flex-wrap items-center justify-end gap-1.5">
              <button
                type="button"
                data-action="approve"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white"
              >
                <Check className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Approve
              </button>
              <button
                type="button"
                data-action="approve-live"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-ithina-purple/35 bg-ithina-purple/15 px-2.5 py-1.5 text-[10px] font-semibold text-ithina-purple transition-all hover:bg-ithina-purple hover:text-white"
              >
                <Zap className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Approve &amp; Go Live
              </button>
              <button
                type="button"
                data-action="reject"
                className="inline-flex items-center gap-1 rounded-lg border border-rose-400/20 bg-transparent px-2.5 py-1.5 text-[10px] font-semibold text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white"
              >
                <X className="size-3 shrink-0" strokeWidth={2.5} aria-hidden />
                Reject
              </button>
              <button
                type="button"
                data-action="history"
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <Clock className="size-3 shrink-0" aria-hidden />
                History
              </button>
            </div>
          ),
      },
    ],
    [pendingAllSelected, pendingAnySelected, selectedIds, toggleAllPending],
  );

  const approvedColumns = useMemo<IthColumnDef<ApprovedRow>[]>(
    () => [
      {
        key: "title",
        label: "Campaign",
        sortable: true,
        render: (row) => <IthPrimaryCell primary={row.title} secondary={row.id} />,
      },
      {
        key: "approvedBy",
        label: "Approved By",
        width: "w-[150px]",
        render: (row) => <span className="text-xs text-slate-400">{row.approvedBy}</span>,
      },
      {
        key: "skus",
        label: "SKUs",
        width: "w-[72px]",
        render: (row) => <span className="font-mono text-sm tabular-nums text-slate-400">{row.skus}</span>,
      },
      {
        key: "hardware",
        label: "Hardware",
        width: "w-[180px]",
        render: (row) => <HardwarePills items={row.hardware} />,
      },
      {
        key: "approvedAt",
        label: "Approved",
        width: "w-[160px]",
        render: (row) => <span className="whitespace-nowrap font-mono text-xs text-slate-500">{row.approvedAt}</span>,
      },
      {
        key: "status",
        label: "Status",
        width: "w-[130px]",
        render: (row) =>
          row.status === "Deployed" ? (
            <IthBadge label="Deployed" variant="emerald" dot pulse />
          ) : (
            <IthBadge label="Scheduled" variant="purple" />
          ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "w-[110px]",
        render: () => (
          <button
            type="button"
            data-action="history"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
          >
            <Clock className="size-3 shrink-0" aria-hidden />
            History
          </button>
        ),
      },
    ],
    [],
  );

  const allColumns = useMemo<IthColumnDef<AllRow>[]>(
    () => [
      {
        key: "select",
        label: "",
        width: "w-[44px]",
        align: "center",
        headerRender: () => (
          <button
            type="button"
            aria-label="Select all"
            onClick={(e) => { e.stopPropagation(); toggleAllInAllTab(!allTabAllSelected); }}
            className={`inline-flex size-4 items-center justify-center rounded border transition-colors ${
              allTabAllSelected
                ? "border-ithina-purple bg-ithina-purple text-white"
                : allTabAnySelected
                  ? "border-ithina-purple bg-ithina-purple/40 text-white"
                  : "border-slate-500/80 bg-transparent text-transparent hover:border-slate-300"
            }`}
          >
            <Check className="size-2.5" strokeWidth={3} aria-hidden />
          </button>
        ),
        render: (row) => (
          <CheckboxCell
            checked={allSelectedIds.has(row.id)}
            label={`Select ${row.title}`}
            dataAttr="data-all-row-checkbox"
          />
        ),
      },
      {
        key: "title",
        label: "Campaign",
        sortable: true,
        render: (row) => <IthPrimaryCell primary={row.title} secondary={row.id} />,
      },
      {
        key: "initiator",
        label: "Initiator",
        width: "w-[150px]",
        render: (row) => <span className="text-xs text-slate-400">{row.initiator}</span>,
      },
      {
        key: "skus",
        label: "SKUs",
        width: "w-[72px]",
        render: (row) => <span className="font-mono text-sm tabular-nums text-slate-400">{row.skus}</span>,
      },
      {
        key: "approvalStatus",
        label: "Approval Status",
        width: "w-[140px]",
        render: (row) => {
          const variants = { Approved: "emerald", Pending: "amber", Rejected: "rose" } as const;
          return (
            <IthBadge
              label={row.approvalStatus}
              variant={variants[row.approvalStatus]}
              dot={row.approvalStatus === "Approved"}
            />
          );
        },
      },
      {
        key: "guardRails",
        label: "Guard Rails",
        width: "w-[130px]",
        render: (row) => (
          <GuardRailsBadge
            label={row.guardRails === "Pass" ? "All Pass" : row.guardRails}
            variant={row.guardRails === "Pass" ? "success" : "warning"}
          />
        ),
      },
      {
        key: "date",
        label: "Date",
        width: "w-[160px]",
        render: (row) => <span className="whitespace-nowrap font-mono text-xs text-slate-500">{row.date}</span>,
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "w-[110px]",
        render: () => (
          <button
            type="button"
            data-action="history"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
          >
            <Clock className="size-3 shrink-0" aria-hidden />
            History
          </button>
        ),
      },
    ],
    [allTabAllSelected, allTabAnySelected, allSelectedIds, toggleAllInAllTab],
  );

  /* ── Tabs config ── */

  const tabItems: { id: TabId; label: string; count: number | null }[] = [
    { id: "pending",  label: "Pending Approval", count: pendingCount },
    { id: "approved", label: "Approved",         count: null },
    { id: "all",      label: "All",              count: null },
  ];

  const bulkDisabled = selectedIds.size === 0;

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <p className="text-sm font-semibold text-rose-400">Failed to load approval queue</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading approval queue..." className="flex-1" />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out]">

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-ithina-border/40 px-7 pb-4 pt-5">

        {/* Tab switcher */}
        <div className="flex gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel p-0.5">
          {tabItems.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setTab(t.id); setPage(1); }}
              className={cn(
                "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                tab === t.id ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
              )}
            >
              {t.label}
              {t.count != null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    tab === t.id ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
                  )}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {tab === "pending" && (
            <>
              {selectedIds.size > 0 && (
                <span className="rounded bg-ithina-purple/10 px-2 py-1 text-[10px] font-semibold text-ithina-purple">
                  {selectedIds.size} selected
                </span>
              )}
              <button
                type="button"
                disabled={bulkDisabled}
                onClick={bulkApprove}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  bulkDisabled
                    ? "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40"
                    : "border-emerald-400/25 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-500 hover:text-white",
                )}
              >
                <Check className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Approve All
              </button>
              <button
                type="button"
                disabled={bulkDisabled}
                onClick={bulkReject}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  bulkDisabled
                    ? "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40"
                    : "border-rose-400/20 text-rose-400 hover:bg-rose-500 hover:text-white",
                )}
              >
                <X className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Reject All
              </button>
            </>
          )}

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              type="search"
              placeholder="Search…"
              aria-label="Search approval queue"
              className="w-44 rounded-lg border border-ithina-border bg-ithina-bg py-1.5 pl-8 pr-3 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "pending" && (
          <IthTable<InboxItem>
            data={filteredPending}
            columns={pendingColumns}
            rowKey={(r) => r.id}
            onRowClick={handlePendingRowClick}
            rowHighlight={(r) => selectedIds.has(r.id) ? "purple" : null}
            pagination={{ page, pageSize: 10, total: filteredPending.length, onPageChange: setPage, rowLabel: "items" }}
            empty={{ message: "No pending submissions." }}
            className="rounded-none border-0 flex-1"
          />
        )}

        {tab === "approved" && (
          <IthTable<ApprovedRow>
            data={filteredApproved}
            columns={approvedColumns}
            rowKey={(r) => r.id}
            pagination={{ page, pageSize: 10, total: filteredApproved.length, onPageChange: setPage, rowLabel: "items" }}
            empty={{ message: "No approved campaigns." }}
            className="rounded-none border-0 flex-1"
          />
        )}

        {tab === "all" && (
          <IthTable<AllRow>
            data={filteredAll}
            columns={allColumns}
            rowKey={(r) => r.id}
            onRowClick={(row, e) => {
              const target = e.target as HTMLElement;
              if (target.closest?.("[data-all-row-checkbox='true']")) toggleAllTabSelect(row.id);
            }}
            rowHighlight={(r) => allSelectedIds.has(r.id) ? "purple" : null}
            pagination={{ page, pageSize: 10, total: filteredAll.length, onPageChange: setPage, rowLabel: "items" }}
            empty={{ message: "No campaigns." }}
            className="rounded-none border-0 flex-1"
          />
        )}
      </div>

      {[...publishWatchIds].map((id) => (
        <ApprovalPublishWatcher
          key={id}
          campaignId={id}
          onDone={() =>
            setPublishWatchIds((prev) => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            })
          }
        />
      ))}
    </div>
  );
}
