/**
 * ApprovalQueueTabulator — Approval queue using DataTable (Tabulator).
 * Tabs: Pending Approval · Approved · Draft · All
 */

import { AlertCircle, Check, Search, X, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ApprovalHistoryDialog,
  type ApprovalHistoryTarget,
} from "@/features/approval/components/approval-history-dialog";
import { ApprovalPublishWatcher } from "@/features/approval/approval-publish-watcher";
import { getSubmittedVariantId } from "@/features/campaign-studio/types";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";
import { useApproveInboxItem, useInboxItems, useRejectInboxItem } from "@/hooks/use-approval";
import { useActiveStoreId } from "@/hooks/use-active-store-id";
import { campaignKeys, useCampaignList } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InboxItem } from "@/types/approval";

type TabId = "pending" | "approved" | "draft" | "all";

const APPROVAL_TABLE_PAGE_SIZE = 15;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Tabulator header filter: case-insensitive substring in joined fields (same idea as All Campaigns). */
function headerTextIncludes(value: unknown, rowData: object, pick: (row: object) => string): boolean {
  const term = String(value ?? "").trim().toLowerCase();
  if (!term) return true;
  return pick(rowData).toLowerCase().includes(term);
}

interface ApprovedRow {
  id: string;
  title: string;
  approvedBy: string;
  skus: number;
  hardware: string[];
  approvedAt: string;
  status: "Deployed" | "Scheduled";
}

type AllRowApprovalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Draft"
  | "Processing"
  | "Scheduled"
  | "Publishing";

interface AllRow {
  id: string;
  title: string;
  initiator: string;
  skus: number;
  approvalStatus: AllRowApprovalStatus;
  guardRails: "Pass" | "1 warning" | "2 warnings";
  date: string;
}

const APPROVAL_STATUS_STYLES: Record<string, string> = {
  Approved:   "border-chart-2/20 bg-chart-2/10 text-chart-2",
  Pending:    "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Rejected:   "border-rose-400/20 bg-rose-400/10 text-rose-400",
  Draft:      "border-slate-400/20 bg-slate-400/10 text-slate-400",
  Processing: "border-purple-400/20 bg-purple-400/10 text-purple-400",
  Scheduled:  "border-sky-400/20 bg-sky-400/10 text-sky-400",
  Publishing: "border-amber-400/20 bg-amber-400/10 text-amber-400",
};

/** Maps API `campaign.status` to All-tab labels; aligns with `mapApiStatusToUi` in campaigns service. */
export function mapApiStatusToApprovalLabel(apiStatus: string | undefined): AllRowApprovalStatus {
  switch (apiStatus) {
    case "pending_approval": return "Pending";
    case "approved":
    case "active":           return "Approved";
    case "rejected":         return "Rejected";
    case "scheduled":        return "Scheduled";
    case "publishing":       return "Publishing";
    case "generating":
    case "processing":       return "Processing";
    default:
      return "Draft";
  }
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
  const qc = useQueryClient();
  const activeStoreId = useActiveStoreId();

  const [tab, setTab]       = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [historyTarget, setHistoryTarget] = useState<ApprovalHistoryTarget | null>(null);
  const [publishWatchIds, setPublishWatchIds] = useState<Set<string>>(() => new Set());

  /* Bulk selection via Tabulator's built-in isBulkEnabled */
  const [selectedPending, setSelectedPending] = useState<InboxItem[]>([]);
  const [, setSelectedAll] = useState<AllRow[]>([]);

  /** Confirmation before calling reject API (bulk from toolbar). */
  const [rejectTarget, setRejectTarget] = useState<InboxItem[] | null>(null);

  const selectedPendingIds = useMemo(() => new Set(selectedPending.map((r) => r.id)), [selectedPending]);

  const openHistory = useCallback((id: string, title: string) => {
    if (!id) return;
    setHistoryTarget({ id, title });
  }, []);

  const requestBulkReject = useCallback(() => {
    if (selectedPending.length === 0) return;
    setRejectTarget([...selectedPending]);
  }, [selectedPending]);

  const handleConfirmReject = useCallback(() => {
    if (!rejectTarget?.length) return;
    for (const item of rejectTarget) {
      if (item.id) rejectMutation.mutate(item.id);
    }
    setSelectedPending([]);
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
  const pendingCount = useMemo(
    () => campaigns.filter((c) => c.apiStatus === "pending_approval").length,
    [campaigns],
  );

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

  /** Same as row-level “Approve & Go Live” — with confirmation toast. */
  const bulkApproveAndGoLive = useCallback(() => {
    if (selectedPending.length === 0) return;
    let ok = 0;
    for (const item of selectedPending) {
      if (!item.id) {
        toast({ title: "Cannot approve", description: "Campaign ID is missing.", variant: "destructive" });
        continue;
      }
      ok += 1;
      approveMutation.mutate(
        { id: item.id, scheduleType: item.scheduleType, selectedVariantId: getCachedVariant(item.id) },
        {
          onSuccess: () => {
            setPublishWatchIds((prev) => new Set([...prev, item.id]));
          },
        },
      );
    }
    if (ok > 0) {
      toast({
        title: "Approved & publishing",
        description: "We’ll notify you when batch render completes for the selected campaign(s).",
      });
    }
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
        approvalStatus: mapApiStatusToApprovalLabel(c.apiStatus),
        guardRails: "Pass" as const,
        date: c.date,
      }))
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.initiator.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [campaigns, search]);

  const draftCount = useMemo(
    () => campaigns.filter((c) => mapApiStatusToApprovalLabel(c.apiStatus) === "Draft").length,
    [campaigns],
  );

  const filteredDraft = useMemo(
    () => filteredAll.filter((r) => r.approvalStatus === "Draft"),
    [filteredAll],
  );

  const historyIconOnly = `<button type="button" data-action="history" class="edit-btn inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-slate-400 transition-all hover:border-primary/40 hover:bg-white/[0.06] hover:text-white" title="Approval history" aria-label="Approval history">
    <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  </button>`;

  /* ── Pending columns ── */
  const pendingColumns = useMemo<DataTableColumn<InboxItem>[]>(
    () => [
      {
        title: "Campaign",
        field: "title",
        minWidth: 220,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) =>
          headerTextIncludes(value, rowData as object, (r) => {
            const row = r as InboxItem;
            return [row.title, row.subtitle ?? "", row.id].join(" ");
          }),
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          const title = escapeHtml(row.title);
          const sub = row.subtitle ? escapeHtml(row.subtitle) : "";
          const urgentBadge = row.urgent
            ? `<span class="rounded border border-rose-400/20 bg-rose-400/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-400">Expires 48H</span>`
            : "";
          const publishingBadge =
            row.apiStatus === "publishing"
              ? `<span class="inline-flex items-center gap-1 rounded border border-amber-400/25 bg-amber-400/[0.08] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-400">
                <svg class="size-2.5 shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/></svg>
                Publishing
              </span>`
              : "";
          return `
            <div class="min-w-0 text-left">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-[13px] font-semibold leading-tight text-foreground">${title}</p>
                ${publishingBadge}
                ${urgentBadge}
              </div>
              ${sub ? `<p class="mt-0.5 font-mono text-[10px] text-muted-foreground opacity-80">${sub}</p>` : ""}
            </div>`;
        },
      },
      {
        title: "Submitted By",
        field: "initiator",
        width: 140,
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<InboxItem>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          return String((rowData as InboxItem).skus).toLowerCase().includes(term);
        },
        formatter: (cell: DataTableCell<InboxItem>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Hardware",
        field: "hardwareTargets",
        width: 180,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) =>
          headerTextIncludes(value, rowData as object, (r) => (r as InboxItem).hardwareTargets?.join(" ") ?? ""),
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          return `<div class="flex flex-wrap gap-1">${hardwarePillsHtml(row.hardwareTargets ?? [])}</div>`;
        },
      },
      {
        title: "Guard Rails",
        field: "metaVariant",
        width: 140,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const row = rowData as InboxItem;
          const label = row.guardRailsLabel ?? (row.metaVariant === "success" ? "All Pass" : row.meta);
          return [label, row.meta, row.metaVariant].join(" ").toLowerCase().includes(term);
        },
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
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const row = rowData as InboxItem;
          return `${row.submittedAt ?? ""} ${row.meta ?? ""}`.toLowerCase().includes(term);
        },
        formatter: (cell: DataTableCell<InboxItem>) => {
          const row = cell.getData();
          return `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${row.submittedAt ?? row.meta ?? ""}</span>`;
        },
      },
      {
        title: "History",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 80,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () => `<div class="flex justify-end">${historyIconOnly}</div>`,
        cellClick: (_e: MouseEvent, cell: DataTableCell<InboxItem>) => {
          const action = (_e.target as HTMLElement).closest("[data-action]") as HTMLElement | null;
          if (!action || action.dataset.action !== "history") return;
          const row = cell.getData();
          if (!row.id) {
            toast({ title: "Cannot open history", description: "Campaign ID is missing.", variant: "destructive" });
            return;
          }
          openHistory(row.id, row.title);
        },
      },
    ],
    [openHistory],
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
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) =>
          headerTextIncludes(value, rowData as object, (r) => {
            const row = r as ApprovedRow;
            return [row.title, row.id].join(" ");
          }),
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const row = cell.getData();
          const title = escapeHtml(row.title);
          return `<div class="text-left">
            <p class="min-w-0 text-[13px] font-semibold leading-tight text-foreground">${title}</p>
          </div>`;
        },
      },
      {
        title: "Approved By",
        field: "approvedBy",
        width: 150,
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          return String((rowData as ApprovedRow).skus).toLowerCase().includes(term);
        },
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Hardware",
        field: "hardware",
        width: 180,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) =>
          headerTextIncludes(value, rowData as object, (r) => (r as ApprovedRow).hardware?.join(" ") ?? ""),
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const row = cell.getData();
          return `<div class="flex flex-wrap gap-1">${hardwarePillsHtml(row.hardware)}</div>`;
        },
      },
      {
        title: "Approved",
        field: "approvedAt",
        width: 160,
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<ApprovedRow>) =>
          `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Status",
        field: "status",
        width: 130,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const s = String((rowData as ApprovedRow).status).toLowerCase();
          return s.includes(term) || (term === "deploy" && s === "deployed");
        },
        formatter: (cell: DataTableCell<ApprovedRow>) => {
          const deployed = cell.getValue() === "Deployed";
          if (deployed) {
            return `<span class="inline-flex items-center gap-1.5 rounded-full border border-chart-2/20 bg-chart-2/10 px-2.5 py-0.5 text-xs font-semibold text-chart-2"><span class="size-1.5 rounded-full bg-current animate-pulse"></span>Deployed</span>`;
          }
          return `<span class="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-400"><span class="size-1.5 rounded-full bg-current"></span>Scheduled</span>`;
        },
      },
      {
        title: "History",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 80,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () => `<div class="flex justify-end">${historyIconOnly}</div>`,
        cellClick: (_e: MouseEvent, cell: DataTableCell<ApprovedRow>) => {
          const t = (_e.target as HTMLElement).closest("[data-action]");
          if (t?.getAttribute("data-action") !== "history") return;
          const row = cell.getData();
          openHistory(row.id, row.title);
        },
      },
    ],
    [openHistory],
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
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) =>
          headerTextIncludes(value, rowData as object, (r) => {
            const row = r as AllRow;
            return [row.title, row.id].join(" ");
          }),
        formatter: (cell: DataTableCell<AllRow>) => {
          const row = cell.getData();
          const title = escapeHtml(row.title);
          return `<div class="text-left">
            <p class="min-w-0 text-[13px] font-semibold leading-tight text-foreground">${title}</p>
          </div>`;
        },
      },
      {
        title: "Initiator",
        field: "initiator",
        width: 150,
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="text-xs text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "SKUs",
        field: "skus",
        width: 72,
        sorter: "number",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          return String((rowData as AllRow).skus).toLowerCase().includes(term);
        },
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="font-mono text-sm tabular-nums text-slate-400">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "Approval Status",
        field: "approvalStatus",
        width: 140,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          return String((rowData as AllRow).approvalStatus).toLowerCase().includes(term);
        },
        formatter: (cell: DataTableCell<AllRow>) => {
          const v = String(cell.getValue() ?? "");
          const cls = APPROVAL_STATUS_STYLES[v] ?? APPROVAL_STATUS_STYLES.Draft;
          const dot = v === "Approved" ? `<span class="size-1.5 rounded-full bg-current"></span>` : "";
          return `<span class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}">${dot}${v}</span>`;
        },
      },
      {
        title: "Guard Rails",
        field: "guardRails",
        width: 130,
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fv: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const v = String((rowData as AllRow).guardRails);
          const label = v === "Pass" ? "All Pass" : v;
          return `${v} ${label}`.toLowerCase().includes(term);
        },
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
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<AllRow>) =>
          `<span class="whitespace-nowrap font-mono text-xs text-slate-500">${String(cell.getValue() ?? "")}</span>`,
      },
      {
        title: "History",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 80,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: () => `<div class="flex justify-end">${historyIconOnly}</div>`,
        cellClick: (_e: MouseEvent, cell: DataTableCell<AllRow>) => {
          const t = (_e.target as HTMLElement).closest("[data-action]");
          if (t?.getAttribute("data-action") !== "history") return;
          const row = cell.getData();
          openHistory(row.id, row.title);
        },
      },
    ],
    [openHistory],
  );

  /* ── Tabs config ── */
  const tabItems: { id: TabId; label: string; count: number | null }[] = [
    { id: "pending",  label: "Pending Approval", count: pendingCount },
    { id: "approved", label: "Approved",         count: null },
    { id: "draft",    label: "Draft",            count: draftCount },
    { id: "all",      label: "All",              count: null },
  ];

  const pendingSelectedCount = selectedPendingIds.size;

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col bg-ithina-bg animate-[fadeIn_0.4s_ease-out]">
      <div className="ithina-page flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-4 pb-4 pt-2 lg:px-8">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex gap-0.5 rounded-lg border border-ithina-border bg-ithina-panel/80 p-0.5">
              {tabItems.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all",
                    tab === t.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-slate-400 hover:text-foreground",
                  )}
                >
                  {t.label}
                  {t.count != null && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        tab === t.id
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-amber-400/20 text-amber-400",
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {tab === "pending" && (
                <>
                  {pendingSelectedCount > 0 && (
                    <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {pendingSelectedCount} selected
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={pendingSelectedCount === 0}
                    onClick={bulkApprove}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-xs font-bold shadow-sm transition-colors",
                      pendingSelectedCount > 0
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "cursor-not-allowed border border-ithina-border/40 bg-transparent text-slate-600 opacity-50",
                    )}
                  >
                    <Check className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={pendingSelectedCount === 0}
                    onClick={bulkApproveAndGoLive}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-md border px-4 text-xs font-bold shadow-sm transition-colors",
                      pendingSelectedCount > 0
                        ? "border-ithina-purple/40 bg-ithina-purple/90 text-white hover:bg-ithina-purple"
                        : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-50",
                    )}
                  >
                    <Zap className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    Approve &amp; go live
                  </button>
                  <button
                    type="button"
                    disabled={pendingSelectedCount === 0}
                    onClick={requestBulkReject}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-md border px-4 text-xs font-bold transition-colors",
                      pendingSelectedCount > 0
                        ? "border-rose-500/40 text-rose-400 hover:border-rose-500 hover:bg-rose-500 hover:text-white"
                        : "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-50",
                    )}
                  >
                    <X className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="group relative shrink-0">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              placeholder="Search by campaign, submitter, or ID…"
              aria-label="Search approval queue"
              className="h-12 w-full rounded-md border border-input bg-card py-2 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {isLoading && (
            <div className="shrink-0 space-y-3 rounded-xl border border-ithina-border/40 bg-ithina-panel/20 p-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full rounded-md" />
              ))}
            </div>
          )}

          {isError && (
            <div
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 py-4 text-rose-300"
              role="alert"
            >
              <AlertCircle className="size-5 shrink-0" />
              <span className="text-sm">Failed to load approval queue</span>
            </div>
          )}

          {!isLoading && !isError && (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {tab === "pending" && (
                <DataTable<InboxItem>
                  data={filteredPending}
                  columns={pendingColumns}
                  rowIdField="id"
                  isBulkEnabled
                  onSelectionChange={setSelectedPending}
                  pagination
                  pageSize={APPROVAL_TABLE_PAGE_SIZE}
                  pageSizeSelector={[5, 10, 15, 20, 50]}
                  emptyMessage="No pending submissions."
                  className="min-h-0 flex-1"
                />
              )}

              {tab === "approved" && (
                <DataTable<ApprovedRow>
                  data={filteredApproved}
                  columns={approvedColumns}
                  rowIdField="id"
                  pagination
                  pageSize={APPROVAL_TABLE_PAGE_SIZE}
                  pageSizeSelector={[5, 10, 15, 20, 50]}
                  emptyMessage="No approved campaigns."
                  className="min-h-0 flex-1"
                />
              )}

              {tab === "draft" && (
                <DataTable<AllRow>
                  data={filteredDraft}
                  columns={allColumns}
                  rowIdField="id"
                  isBulkEnabled
                  onSelectionChange={setSelectedAll}
                  pagination
                  pageSize={APPROVAL_TABLE_PAGE_SIZE}
                  pageSizeSelector={[5, 10, 15, 20, 50]}
                  emptyMessage="No draft campaigns."
                  className="min-h-0 flex-1"
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
                  pageSize={APPROVAL_TABLE_PAGE_SIZE}
                  pageSizeSelector={[5, 10, 15, 20, 50]}
                  emptyMessage="No campaigns."
                  className="min-h-0 flex-1"
                />
              )}
            </div>
          )}
        </div>
      </div>

      <ApprovalHistoryDialog
        open={historyTarget !== null}
        onOpenChange={(open) => {
          if (!open) setHistoryTarget(null);
        }}
        target={historyTarget}
      />

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null);
        }}
      >
        <DialogContent showClose className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject selected campaigns?</DialogTitle>
            <DialogDescription className="text-left">
              {rejectTarget && rejectTarget.length > 0 ? (
                <>
                  Are you sure you want to reject{" "}
                  <span className="font-semibold text-slate-200">{rejectTarget.length}</span>{" "}
                  selected campaign{rejectTarget.length === 1 ? "" : "s"}? This cannot be undone.
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

