/**
 * ApprovalQueueTabulator — Three-tab approval queue using DataTable (Tabulator).
 * Tabs: Pending Approval · Approved · All
 */

import { Check, Search, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApprovalPublishWatcher } from "@/features/approval/approval-publish-watcher";
import { getSubmittedVariantId } from "@/features/campaign-studio/types";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";
import { useApproveInboxItem, useInboxItems, useRejectInboxItem } from "@/hooks/use-approval";
import { useActiveStoreId } from "@/hooks/use-active-store-id";
import { campaignKeys, useCampaignList } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types/approval";

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

/* ── HTML formatter helpers ── */

function hardwarePillsHtml(items: string[]): string {
  return items
    .map((hw) => {
      const cls = hw.startsWith("ESL")
        ? "bg-blue-400/10 border-blue-400/20 text-blue-300"
        : "bg-amber-400/10 border-amber-400/20 text-amber-300";
      return `<span class="rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium ${cls}">${hw}</span>`;
    })
    .join("");
}

function guardRailsHtml(label: string, variant: "success" | "warning"): string {
  if (variant === "success") {
    return `<span class="inline-flex items-center gap-1 rounded border border-chart-2/20 bg-chart-2/10 px-2 py-0.5 font-mono text-[10px] text-chart-2">
      <svg class="size-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>${label}</span>`;
  }
  return `<span class="inline-flex items-center gap-1 rounded border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 font-mono text-[10px] text-amber-400">
    <svg class="size-2.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${label}</span>`;
}

/* ── Component ── */

export default function ApprovalQueueTabulator() {
  const { data: inbox = [], isLoading, isError } = useInboxItems();
  const { data: campaigns = [] } = useCampaignList();
  const approveMutation = useApproveInboxItem();
  const rejectMutation = useRejectInboxItem();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const activeStoreId = useActiveStoreId();

  const [tab, setTab]       = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [publishWatchIds, setPublishWatchIds] = useState<Set<string>>(() => new Set());

  /* Bulk selection via Tabulator's built-in isBulkEnabled */
  const [selectedPending, setSelectedPending] = useState<InboxItem[]>([]);
  const [, setSelectedAll] = useState<AllRow[]>([]);

  /** Confirmation before calling reject API (single row or bulk). */
  const [rejectTarget, setRejectTarget] = useState<
    | null
    | { type: "single"; id: string; title: string }
    | { type: "bulk"; items: InboxItem[] }
  >(null);

  const selectedPendingIds = useMemo(() => new Set(selectedPending.map((r) => r.id)), [selectedPending]);

  /* Stable handler refs to avoid column re-creation on every render */
  const approveRef   = useRef(approveMutation);
  const navigateRef  = useRef(navigate);
  approveRef.current  = approveMutation;
  navigateRef.current = navigate;

  const requestSingleReject = useCallback((row: InboxItem) => {
    if (!row.id) return;
    setRejectTarget({ type: "single", id: row.id, title: row.title });
  }, []);

  const requestBulkReject = useCallback(() => {
    if (selectedPending.length === 0) return;
    setRejectTarget({ type: "bulk", items: [...selectedPending] });
  }, [selectedPending]);

  const handleConfirmReject = useCallback(() => {
    if (!rejectTarget) return;
    if (rejectTarget.type === "single") {
      rejectMutation.mutate(rejectTarget.id);
    } else {
      for (const item of rejectTarget.items) {
        if (item.id) rejectMutation.mutate(item.id);
      }
      setSelectedPending([]);
    }
    setRejectTarget(null);
  }, [rejectMutation, rejectTarget]);

  const getCachedVariant = useCallback(
    (campaignId: string): string | undefined =>
      getSubmittedVariantId(
        qc.getQueryData<ApiCampaignEventResponse[]>([
          ...campaignKeys.timeline(campaignId, activeStoreId),
          "eventsPoll",
        ]) ?? [],
      ) ?? undefined,
    [qc, activeStoreId],
  );

  /* ── Pending tab ── */
  const pendingCount = useMemo(() => inbox.filter((i) => i.status === "pending").length, [inbox]);

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inbox.filter((i) => {
      if (i.status !== "pending") return false;
      return !q || i.title.toLowerCase().includes(q) || i.initiator.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
    });
  }, [inbox, search]);

  const bulkApprove = useCallback(() => {
    selectedPending.forEach((item) => {
      if (!item.id) { toast({ title: "Cannot approve", description: "Campaign ID is missing.", variant: "destructive" }); return; }
      approveMutation.mutate(
        { id: item.id, scheduleType: item.scheduleType, selectedVariantId: getCachedVariant(item.id) },
        { onSuccess: () => setPublishWatchIds((prev) => new Set([...prev, item.id])) },
      );
    });
    setSelectedPending([]);
  }, [approveMutation, getCachedVariant, selectedPending]);

  /* ── Approved tab ── */
  const filteredApproved = useMemo((): ApprovedRow[] => {
    const q = search.trim().toLowerCase();
    return campaigns
      .filter((c) => c.approvalStatus === "approved")
      .map((c) => ({
        id: c.id, title: c.name,
        approvedBy: c.reviewedByName ?? "Checker",
        skus: c.skus, hardware: c.hardware,
        approvedAt: c.reviewedAt ?? c.date,
        status: "Deployed" as const,
      }))
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [campaigns, search]);

  /* ── All tab ── */
  const filteredAll = useMemo((): AllRow[] => {
    const q = search.trim().toLowerCase();
    return campaigns
      .map((c) => ({
        id: c.id, title: c.name,
        initiator: c.ownerName ?? c.initiator,
        skus: c.skus,
        approvalStatus: (c.approvalStatus === "approved" ? "Approved" : c.approvalStatus === "rejected" ? "Rejected" : "Pending") as AllRow["approvalStatus"],
        guardRails: "Pass" as const,
        date: c.date,
      }))
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.initiator.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [campaigns, search]);

  /* ── Pending columns ── */
  const pendingColumns = useMemo<DataTableColumn<InboxItem>[]>(
    () => [
      {
        title: "Campaign",
        field: "title",
        minWidth: 220,
        headerHozAlign: "left",
        hozAlign: "left",
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          const urgentBadge = row.urgent
            ? `<span class="rounded border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-400">Expires 48H</span>`
            : "";
          return `<div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[13px] font-semibold leading-tight text-white">${row.title}</p>
              ${urgentBadge}
            </div>
            ${row.subtitle ? `<p class="mt-0.5 font-mono text-[10px] text-slate-500">${row.subtitle}</p>` : ""}
          </div>`;
        },
      },
      {
        title: "Submitted By",
        field: "initiator",
        width: 140,
        formatter: (cell: DataTableCell<InboxItem>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        formatter: (cell: DataTableCell<InboxItem>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Hardware",
        field: "hardwareTargets",
        width: 180,
        headerFilter: false,
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          return `<div class="flex flex-wrap gap-1">${hardwarePillsHtml(row.hardwareTargets ?? [])}</div>`;
        },
      },
      {
        title: "Guard Rails",
        field: "metaVariant",
        width: 140,
        headerFilter: false,
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          const label = row.guardRailsLabel ?? (row.metaVariant === "success" ? "All Pass" : row.meta);
          const variant = row.metaVariant === "success" ? "success" : "warning";
          return guardRailsHtml(label, variant);
        },
      },
      {
        title: "Submitted",
        field: "submittedAt",
        width: 160,
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          return `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${row.submittedAt ?? row.meta ?? ""}</span>`;
        },
      },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 320,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          if (row.apiStatus === "publishing") {
            return `<div class="flex items-center justify-end gap-2">
              <span class="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/[0.08] px-3 py-1.5 font-mono text-[10px] text-amber-400">
                <svg class="size-3 shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                Batch rendering…
              </span>
              <button data-action="history" class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
                <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>View
              </button>
            </div>`;
          }
          return `<div class="flex max-w-[320px] flex-wrap items-center justify-end gap-1.5">
            <button data-action="approve" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-chart-2/25 bg-chart-2/10 px-2.5 py-1.5 text-[10px] font-semibold text-chart-2 transition-all hover:bg-chart-2/20 hover:text-white">
              <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Approve
            </button>
            <button data-action="approve-live" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-purple-500/35 bg-purple-500/15 px-2.5 py-1.5 text-[10px] font-semibold text-purple-400 transition-all hover:bg-purple-500 hover:text-white">
              <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Approve &amp; Go Live
            </button>
            <button data-action="reject" class="inline-flex items-center gap-1 rounded-lg border border-rose-400/20 bg-transparent px-2.5 py-1.5 text-[10px] font-semibold text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white">
              <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Reject
            </button>
            <button data-action="history" class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
              <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>History
            </button>
          </div>`;
        },
        cellClick: (_e: MouseEvent, cell: DataTableCell<InboxItem>) => {
          const action = (_e.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
          if (!action) return;
          const row = cell.getData();
          if (!row.id) {
            toast({ title: "Cannot perform action", description: "Campaign ID is missing.", variant: "destructive" });
            return;
          }
          const a = action.dataset.action;
          if (a === "approve") {
            approveRef.current.mutate(
              { id: row.id, scheduleType: row.scheduleType, selectedVariantId: getCachedVariant(row.id) },
              { onSuccess: () => setPublishWatchIds((prev) => new Set([...prev, row.id])) },
            );
          }
          if (a === "approve-live") {
            approveRef.current.mutate(
              { id: row.id, scheduleType: row.scheduleType, selectedVariantId: getCachedVariant(row.id) },
              {
                onSuccess: () => {
                  setPublishWatchIds((prev) => new Set([...prev, row.id]));
                  toast({ title: "Approved & publishing", description: "We'll notify you when batch render completes." });
                },
              },
            );
          }
          if (a === "reject") requestSingleReject(row);
          if (a === "history") {
            void navigateRef.current({ to: "/maker/campaign/$campaignId/studio", params: { campaignId: row.id } });
          }
        },
      },
    ],
    [getCachedVariant, requestSingleReject],
  );

  /* ── Approved columns ── */
  const approvedColumns = useMemo<DataTableColumn<ApprovedRow>[]>(
    () => [
      {
        title: "Campaign",
        field: "title",
        minWidth: 180,
        headerHozAlign: "left",
        hozAlign: "left",
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const row = cell.getData();
          return `<div class="text-left">
            <p class="text-[13px] font-semibold leading-tight text-white">${row.title}</p>
          </div>`;
        },
      },
      {
        title: "Approved By",
        field: "approvedBy",
        width: 150,
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Hardware",
        field: "hardware",
        width: 180,
        headerFilter: false,
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const row = cell.getData();
          return `<div class="flex flex-wrap gap-1">${hardwarePillsHtml(row.hardware)}</div>`;
        },
      },
      {
        title: "Approved",
        field: "approvedAt",
        width: 160,
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Status",
        field: "status",
        width: 130,
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const deployed = cell.getValue() === "Deployed";
          if (deployed) {
            return `<span class="inline-flex items-center gap-1.5 rounded-full border border-chart-2/20 bg-chart-2/10 px-2.5 py-0.5 text-xs font-semibold text-chart-2"><span class="size-1.5 rounded-full bg-current animate-pulse"></span>Deployed</span>`;
          }
          return `<span class="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-400"><span class="size-1.5 rounded-full bg-current"></span>Scheduled</span>`;
        },
      },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 110,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () =>
          `<button data-action="history" class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
            <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>History
          </button>`,
      },
    ],
    [],
  );

  /* ── All columns ── */
  const allColumns = useMemo<DataTableColumn<AllRow>[]>(
    () => [
      {
        title: "Campaign",
        field: "title",
        minWidth: 180,
        headerHozAlign: "left",
        hozAlign: "left",
        formatter: (cell: DataTableCell<AllRow>) => {
          const row = cell.getData();
          return `<div class="text-left">
            <p class="text-[13px] font-semibold leading-tight text-white">${row.title}</p>
          </div>`;
        },
      },
      {
        title: "Initiator",
        field: "initiator",
        width: 150,
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Approval Status",
        field: "approvalStatus",
        width: 140,
        formatter: (cell: DataTableCell<AllRow>) => {
          const v = String(cell.getValue() ?? "");
          const map: Record<string, string> = {
            Approved: "border-chart-2/20 bg-chart-2/10 text-chart-2",
            Pending:  "border-amber-400/20 bg-amber-400/10 text-amber-400",
            Rejected: "border-rose-400/20 bg-rose-400/10 text-rose-400",
          };
          const cls = map[v] ?? map.Pending;
          const dot = v === "Approved" ? `<span class="size-1.5 rounded-full bg-current"></span>` : "";
          return `<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}">${dot}${v}</span>`;
        },
      },
      {
        title: "Guard Rails",
        field: "guardRails",
        width: 130,
        headerFilter: false,
        formatter: (cell: DataTableCell<AllRow>) => {
          const v = String(cell.getValue() ?? "");
          const label = v === "Pass" ? "All Pass" : v;
          return guardRailsHtml(label, v === "Pass" ? "success" : "warning");
        },
      },
      {
        title: "Date",
        field: "date",
        width: 160,
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 110,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () =>
          `<button data-action="history" class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
            <svg class="size-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>History
          </button>`,
      },
    ],
    [],
  );

  /* ── Tabs config ── */
  const tabItems: { id: TabId; label: string; count: number | null }[] = [
    { id: "pending",  label: "Pending Approval", count: pendingCount },
    { id: "approved", label: "Approved",         count: null },
    { id: "all",      label: "All",              count: null },
  ];

  const pendingSelectedCount = selectedPendingIds.size;

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
              onClick={() => setTab(t.id)}
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
              {pendingSelectedCount > 0 && (
                <span className="rounded bg-ithina-purple/10 px-2 py-1 text-[10px] font-semibold text-ithina-purple">
                  {pendingSelectedCount} selected
                </span>
              )}
              <button
                type="button"
                disabled={pendingSelectedCount === 0}
                onClick={bulkApprove}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  pendingSelectedCount > 0
                    ? "border-chart-2/25 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
                )}
              >
                <Check className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Approve All
              </button>
              <button
                type="button"
                disabled={pendingSelectedCount === 0}
                onClick={requestBulkReject}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  pendingSelectedCount > 0
                    ? "border-rose-400/20 text-rose-400 hover:bg-rose-500 hover:text-white"
                    : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40",
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
              onChange={(e) => setSearch(e.target.value)}
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
          <DataTable<InboxItem>
            data={filteredPending}
            columns={pendingColumns}
            rowIdField="id"
            isBulkEnabled
            onSelectionChange={setSelectedPending}
            pagination
            pageSize={10}
            emptyMessage="No pending submissions."
            headerFilters={false}
            className="rounded-none border-0 flex-1"
          />
        )}

        {tab === "approved" && (
          <DataTable<ApprovedRow>
            data={filteredApproved}
            columns={approvedColumns}
            rowIdField="id"
            pagination
            pageSize={10}
            emptyMessage="No approved campaigns."
            headerFilters={false}
            className="rounded-none border-0 flex-1"
          />
        )}

        {tab === "all" && (
          <DataTable<AllRow>
            data={filteredAll}
            columns={allColumns}
            rowIdField="id"
            isBulkEnabled
            onSelectionChange={setSelectedAll}
            pagination
            pageSize={10}
            emptyMessage="No campaigns."
            headerFilters={false}
            className="rounded-none border-0 flex-1"
          />
        )}
      </div>

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <DialogContent showClose className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {rejectTarget?.type === "bulk" ? "Reject selected campaigns?" : "Reject this campaign?"}
            </DialogTitle>
            <DialogDescription className="text-left">
              {rejectTarget?.type === "single" ? (
                <>
                  Are you sure you want to reject{" "}
                  <span className="font-semibold text-slate-200">{rejectTarget.title}</span>? This
                  cannot be undone.
                </>
              ) : rejectTarget?.type === "bulk" ? (
                <>
                  Are you sure you want to reject{" "}
                  <span className="font-semibold text-slate-200">{rejectTarget.items.length}</span>{" "}
                  selected campaign{rejectTarget.items.length === 1 ? "" : "s"}? This cannot be undone.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting…" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

