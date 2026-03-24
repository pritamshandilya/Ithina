import { Check, Search, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import LoadingSpinner from "@/components/shared/loading-spinner";
import { PrototypeTabulator, type PrototypeTabulatorColumn } from "@/components/ui/prototype-tabulator";
import { useInboxItems } from "@/hooks/use-approval";
import { approvalKeys } from "@/hooks/use-approval";
import type { InboxItem } from "@/types/approval";

import { cn } from "@/lib/utils";

type TabId = "pending" | "approved" | "all";
type ApprovedRow = {
  id: string;
  title: string;
  approvedBy: string;
  skus: number;
  hardware: string[];
  approvedAt: string;
  status: "Deployed" | "Scheduled";
};
type AllRow = {
  id: string;
  title: string;
  initiator: string;
  skus: number;
  approvalStatus: "Pending" | "Approved" | "Rejected";
  guardRails: "Pass" | "1 warning" | "2 warnings";
  date: string;
};

function statusPill(metaVariant: InboxItem["metaVariant"], label?: string) {
  const text = label ?? "—";
  if (metaVariant === "success") {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">${text}</span>`;
  }
  if (metaVariant === "warning") {
    return `<span class="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">${text}</span>`;
  }
  return `<span class="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/10">${text}</span>`;
}

/** index_3.1.html pending row guard rails (check + All Pass | warning icon + label). */
function guardRailsPendingHtml(r: InboxItem) {
  const label = r.guardRailsLabel ?? r.meta;
  if (r.metaVariant === "success") {
    return `<span class="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/8 px-2 py-0.5 font-mono text-[10px] text-emerald-400"><svg class="size-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>All Pass</span>`;
  }
  return `<span class="inline-flex items-center gap-1 rounded border border-amber-400/20 bg-amber-400/8 px-2 py-0.5 font-mono text-[10px] text-amber-400"><svg class="size-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>${label}</span>`;
}

function hardwarePill(hw: string) {
  if (hw.startsWith("ESL")) {
    return `<span class="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border bg-blue-400/8 border-blue-400/20 text-blue-300">${hw}</span>`;
  }
  return `<span class="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border bg-amber-400/8 border-amber-400/20 text-amber-300">${hw}</span>`;
}

function approvedByLabel(initiator: string) {
  if (initiator === "Auto-Scheduled") return "Store Manager";
  return initiator;
}

function deploymentStatusPill(status: "Deployed" | "Scheduled") {
  if (status === "Deployed") {
    return `<span class="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">● Deployed</span>`;
  }
  return `<span class="inline-flex items-center gap-1 rounded border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] font-mono text-violet-300">Scheduled</span>`;
}

function approvedCampaignStatus(row: InboxItem): "Deployed" | "Scheduled" {
  // Prototype parity: approved list mixes deployed + scheduled outcomes.
  if (row.title.toLowerCase().includes("spring")) return "Scheduled";
  return "Deployed";
}

export default function ApprovalQueueTabulator() {
  const queryClient = useQueryClient();
  const { data: inbox = [], isLoading, isError } = useInboxItems();

  const [tab, setTab] = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;

  const selectionRevision = useMemo(
    () => `${selectedIds.size}:${[...selectedIds].sort().join(",")}`,
    [selectedIds],
  );

  const pendingRowFormatter = useCallback((row: InboxItem, el: HTMLElement) => {
    el.classList.toggle("approval-queue-row-selected", selectedIdsRef.current.has(row.id));
  }, []);

  const approvedRows = useMemo<ApprovedRow[]>(
    () => [
      {
        id: "CMP-9941-A",
        title: "Weekend Beverage Promo",
        approvedBy: "Store Manager",
        skus: 42,
        hardware: ['ESL 4.2"', 'LCD 10"'],
        approvedAt: "Mar 8 · 08:00 AM",
        status: "Deployed",
      },
      {
        id: "CMP-9940-B",
        title: "Sushi Clearance – Urgent",
        approvedBy: "Sarah J.",
        skus: 4,
        hardware: ['ESL 4.2"', 'ESL 2.9"'],
        approvedAt: "Mar 7 · 11:15 AM",
        status: "Deployed",
      },
      {
        id: "CMP-9938-D",
        title: "Spring Produce Launch",
        approvedBy: "Store Manager",
        skus: 76,
        hardware: ['ESL 4.2"', 'LCD 10"'],
        approvedAt: "Mar 6 · 14:00 PM",
        status: "Scheduled",
      },
      {
        id: "CMP-9936-F",
        title: "BOGO Snacks Promotion",
        approvedBy: "Sarah J.",
        skus: 22,
        hardware: ['ESL 4.2"'],
        approvedAt: "Mar 3 · 09:30 AM",
        status: "Deployed",
      },
    ],
    [],
  );
  const allRows = useMemo<AllRow[]>(
    () => [
      {
        id: "CMP-9937-E",
        title: "Dairy & Bakery Weekend",
        initiator: "Marcus T.",
        skus: 31,
        approvalStatus: "Pending",
        guardRails: "Pass",
        date: "Mar 14 · 10:05 AM",
      },
      {
        id: "CMP-9939-C",
        title: "Electronics Flash Sale",
        initiator: "Sarah J.",
        skus: 18,
        approvalStatus: "Pending",
        guardRails: "1 warning",
        date: "Mar 13 · 15:22 PM",
      },
      {
        id: "CMP-9942-H",
        title: "Frozen Food Clearance",
        initiator: "Auto-Scheduled",
        skus: 12,
        approvalStatus: "Pending",
        guardRails: "Pass",
        date: "Mar 12 · 09:44 AM",
      },
      {
        id: "CMP-9941-A",
        title: "Weekend Beverage Promo",
        initiator: "Store Manager",
        skus: 42,
        approvalStatus: "Approved",
        guardRails: "Pass",
        date: "Mar 8 · 08:00 AM",
      },
      {
        id: "CMP-9940-B",
        title: "Sushi Clearance – Urgent",
        initiator: "Sarah J.",
        skus: 4,
        approvalStatus: "Approved",
        guardRails: "Pass",
        date: "Mar 7 · 11:15 AM",
      },
      {
        id: "CMP-9938-D",
        title: "Spring Produce Launch",
        initiator: "Store Manager",
        skus: 76,
        approvalStatus: "Approved",
        guardRails: "Pass",
        date: "Mar 6 · 14:00 PM",
      },
      {
        id: "CMP-9935-G",
        title: "Valentine's Day Special",
        initiator: "Auto-Scheduled",
        skus: 15,
        approvalStatus: "Approved",
        guardRails: "Pass",
        date: "Feb 14 · 08:00 AM",
      },
      {
        id: "CMP-9934-X",
        title: "New Year Markdowns",
        initiator: "Marcus T.",
        skus: 9,
        approvalStatus: "Rejected",
        guardRails: "2 warnings",
        date: "Jan 2 · 10:00 AM",
      },
    ],
    [],
  );

  const pendingCount = useMemo(() => inbox.filter((i) => i.status === "pending").length, [inbox]);
  const approvedCount = useMemo(() => inbox.filter((i) => i.status === "approved").length, [inbox]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inbox.filter((i) => {
      const matchTab = tab === "all" ? true : i.status === tab;
      const matchSearch =
        !q ||
        i.title.toLowerCase().includes(q) ||
        i.initiator.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        String(i.skus).includes(q);
      return matchTab && matchSearch;
    });
  }, [inbox, search, tab]);

  const allSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every((i) => selectedIds.has(i.id));
  }, [filtered, selectedIds]);

  const anySelected = useMemo(
    () => filtered.some((i) => selectedIds.has(i.id)),
    [filtered, selectedIds],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds(new Set());
        return;
      }
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    },
    [filtered],
  );

  const bulkApprovePending = useCallback(() => {
    if (selectedIds.size === 0) return;
    queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
      if (!prev) return prev;
      return prev.map((it) =>
        selectedIds.has(it.id) && it.status === "pending" ? { ...it, status: "approved" as const } : it,
      );
    });
    setSelectedIds(new Set());
  }, [queryClient, selectedIds]);

  const bulkRejectPending = useCallback(() => {
    if (selectedIds.size === 0) return;
    queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
      if (!prev) return prev;
      return prev.map((it) =>
        selectedIds.has(it.id) && it.status === "pending" ? { ...it, status: "rejected" as const } : it,
      );
    });
    setSelectedIds(new Set());
  }, [queryClient, selectedIds]);

  const onAction = useCallback(
    (e: MouseEvent, row: InboxItem) => {
      const target = e.target as HTMLElement | null;
      const rowCheckbox = target?.closest?.("[data-proto-row-checkbox='true']") as HTMLInputElement | null;
      if (rowCheckbox) {
        toggleSelect(row.id);
        return;
      }

      const actionEl = target?.closest?.("[data-action]") as HTMLElement | null;
      if (!actionEl) return;

      const action = actionEl.getAttribute("data-action");
      if (!action) return;

      if (action === "approve") {
        queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
          if (!prev) return prev;
          return prev.map((it) => (it.id === row.id ? { ...it, status: "approved" } : it));
        });
      }

      if (action === "reject") {
        queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
          if (!prev) return prev;
          return prev.map((it) => (it.id === row.id ? { ...it, status: "rejected" } : it));
        });
      }

      // History is prototype-only for now.
      if (action === "history") {
        // no-op
      }
    },
    [queryClient, toggleSelect],
  );

  const approvedColumns = useMemo<PrototypeTabulatorColumn<ApprovedRow>[]>(() => {
    return [
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</div>`,
        field: "title",
        headerSort: false,
        hozAlign: "left",
        width: 260,
        minWidth: 230,
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return `<div class="min-w-0 py-1">
            <p class="text-sm font-semibold text-white truncate leading-tight">${r.title}</p>
            <p class="text-[10px] font-mono text-slate-600 mt-0.5">${r.id}</p>
          </div>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Approved By</div>`,
        field: "approvedBy",
        width: 140,
        minWidth: 130,
        hozAlign: "left",
        headerSort: false,
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return `<span class="text-xs text-slate-400">${r.approvedBy}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</div>`,
        field: "skus",
        width: 70,
        minWidth: 60,
        headerSort: false,
        hozAlign: "left",
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return `<span class="text-sm font-mono text-slate-400">${r.skus}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Hardware</div>`,
        field: "hardware",
        headerSort: false,
        hozAlign: "left",
        width: 170,
        minWidth: 150,
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return `<div class="flex flex-wrap gap-1">${r.hardware.map(hardwarePill).join("")}</div>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Approved</div>`,
        field: "approvedAt",
        headerSort: false,
        hozAlign: "left",
        width: 165,
        minWidth: 150,
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return `<span class="text-xs text-slate-500 font-mono whitespace-nowrap">${r.approvedAt}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Status</div>`,
        field: "status",
        headerSort: false,
        hozAlign: "left",
        width: 120,
        minWidth: 110,
        formatter: (cell) => {
          const r = cell.getData() as ApprovedRow;
          return deploymentStatusPill(r.status);
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">Actions</div>`,
        field: "id",
        headerSort: false,
        hozAlign: "right",
        width: 120,
        minWidth: 110,
        formatter: () => {
          return `<div class="flex w-full items-center justify-end">
            <button data-action="history" class="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
              History
            </button>
          </div>`;
        },
      },
    ];
  }, []);

  const allColumns = useMemo<PrototypeTabulatorColumn<AllRow>[]>(() => {
    return [
      {
        title: `<input type="checkbox" data-proto-header-checkbox="true" aria-label="Select all rows" class="accent-purple-500 cursor-pointer" />`,
        field: "id",
        headerSort: false,
        hozAlign: "center",
        width: 36,
        minWidth: 36,
        formatter: () => `<input type="checkbox" data-proto-row-checkbox="true" class="accent-purple-500 cursor-pointer" aria-label="Select row" />`,
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</div>`,
        field: "title",
        headerSort: false,
        hozAlign: "left",
        width: 260,
        minWidth: 240,
        formatter: (cell) => {
          const r = cell.getData() as AllRow;
          return `<div class="min-w-0 py-1">
            <p class="text-sm font-semibold text-white truncate leading-tight">${r.title}</p>
            <p class="text-[10px] font-mono text-slate-600 mt-0.5">${r.id}</p>
          </div>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Initiator</div>`,
        field: "initiator",
        width: 140,
        minWidth: 130,
        headerSort: false,
        hozAlign: "left",
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</div>`,
        field: "skus",
        width: 70,
        minWidth: 60,
        headerSort: false,
        hozAlign: "left",
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Approval Status</div>`,
        field: "approvalStatus",
        width: 130,
        minWidth: 120,
        headerSort: false,
        hozAlign: "left",
        formatter: (cell) => {
          const r = cell.getData() as AllRow;
          if (r.approvalStatus === "Approved") {
            return `<span class="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">● Approved</span>`;
          }
          if (r.approvalStatus === "Rejected") {
            return `<span class="inline-flex items-center gap-1 rounded border border-rose-400/25 bg-rose-400/10 px-2 py-0.5 text-[10px] font-mono text-rose-300">Rejected</span>`;
          }
          return `<span class="inline-flex items-center gap-1 rounded border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">Pending</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Guard Rails</div>`,
        field: "guardRails",
        width: 120,
        minWidth: 110,
        headerSort: false,
        hozAlign: "left",
        formatter: (cell) => {
          const r = cell.getData() as AllRow;
          if (r.guardRails === "Pass") {
            return `<span class="inline-flex items-center gap-1 rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-mono text-emerald-300">Pass</span>`;
          }
          if (r.guardRails === "2 warnings") {
            return `<span class="inline-flex items-center gap-1 rounded border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">2 warnings</span>`;
          }
          return `<span class="inline-flex items-center gap-1 rounded border border-amber-400/25 bg-amber-400/10 px-2 py-0.5 text-[10px] font-mono text-amber-300">1 warning</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Date</div>`,
        field: "date",
        width: 150,
        minWidth: 140,
        headerSort: false,
        hozAlign: "left",
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">Actions</div>`,
        field: "id",
        width: 110,
        minWidth: 100,
        headerSort: false,
        hozAlign: "right",
        formatter: () => `<div class="flex w-full items-center justify-end">
          <button data-action="history" class="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">History</button>
        </div>`,
      },
    ];
  }, []);

  const columns = useMemo<PrototypeTabulatorColumn<InboxItem>[]>(() => {
    if (tab === "approved") {
      return [] as unknown as PrototypeTabulatorColumn<InboxItem>[];
    }

    return [
      {
        title: `<input type="checkbox" data-proto-header-checkbox="true" aria-label="Select all approvals" class="accent-purple-500 cursor-pointer" />`,
        field: "id",
        headerSort: false,
        hozAlign: "center",
        width: 40,
        minWidth: 40,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          const checked = selectedIdsRef.current.has(r.id);
          return `<input type="checkbox" data-proto-row-checkbox="true" class="accent-purple-500 cursor-pointer" ${checked ? "checked" : ""} aria-label="Select ${r.title}" />`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Campaign</div>`,
        field: "title",
        headerSort: false,
        hozAlign: "left",
        width: 230,
        minWidth: 200,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          const urgentTag = r.urgent
            ? `<span class="ml-2 rounded border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-rose-400">Expires 48H</span>`
            : "";
          const subtitle = r.subtitle ? `<p class="text-[10px] font-mono text-slate-500 mt-0.5">${r.subtitle}</p>` : "";

          return `<div class="min-w-0 py-1">
              <div class="flex items-center gap-2 min-w-0">
                <p class="text-sm font-semibold text-white truncate leading-tight">${r.title}</p>
                ${urgentTag}
              </div>
              <p class="text-[10px] font-mono text-slate-600 mt-0.5">${r.id}</p>
              ${subtitle}
          </div>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Submitted By</div>`,
        field: "initiator",
        width: 130,
        minWidth: 120,
        hozAlign: "left",
        headerSort: false,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          return `<span class="text-xs text-slate-400">${r.initiator}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">SKUs</div>`,
        field: "skus",
        width: 70,
        minWidth: 60,
        headerSort: false,
        hozAlign: "left",
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          return `<span class="text-sm font-mono text-slate-400 tabular-nums">${r.skus}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Hardware</div>`,
        field: "hardwareTargets",
        headerSort: false,
        hozAlign: "left",
        width: 170,
        minWidth: 150,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          const hw = r.hardwareTargets ?? [];
          return `<div class="flex flex-wrap gap-1">${hw.map(hardwarePill).join("")}</div>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Guard Rails</div>`,
        field: "guardRailsLabel",
        headerSort: false,
        hozAlign: "left",
        width: 140,
        minWidth: 130,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          return guardRailsPendingHtml(r);
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">Submitted</div>`,
        field: "submittedAt",
        headerSort: false,
        hozAlign: "left",
        width: 150,
        minWidth: 130,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          return `<span class="text-xs text-slate-500 font-mono whitespace-nowrap">${r.submittedAt ?? r.meta}</span>`;
        },
      },
      {
        title: `<div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-right">Actions</div>`,
        field: "id",
        headerSort: false,
        hozAlign: "right",
        width: 260,
        minWidth: 240,
        formatter: (cell) => {
          const r = cell.getData() as InboxItem;
          return `<div class="flex items-center justify-end gap-1.5">
            <button type="button" data-action="approve" class="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white">
              <svg class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Approve
            </button>
            <button type="button" data-action="reject" class="inline-flex items-center gap-1 rounded-lg border border-rose-400/20 bg-transparent px-2.5 py-1.5 text-[10px] font-semibold text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white">
              <svg class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              Reject
            </button>
            <button type="button" data-action="history" class="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white">
              <svg class="size-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              History
            </button>
          </div>`;
        },
      },
    ];
  }, [tab]);

  const approvedRowsFiltered = useMemo(() => {
    if (tab !== "approved") return [];
    const q = search.trim().toLowerCase();
    return approvedRows.filter((row) => {
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.approvedBy.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
      );
    });
  }, [approvedRows, search, tab]);
  const allRowsFiltered = useMemo(() => {
    if (tab !== "all") return [];
    const q = search.trim().toLowerCase();
    return allRows.filter((row) => {
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.initiator.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, tab]);

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
        <div className="text-rose-400 text-sm font-semibold">Failed to load approval queue</div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading approval queue..." className="flex-1" />;
  }

  const tabItems: { id: TabId; label: string; count: number | null }[] = [
    { id: "pending", label: "Pending Approval", count: pendingCount },
    { id: "approved", label: "Approved", count: null },
    { id: "all", label: "All", count: null },
  ];

  const bulkDisabled = selectedIds.size === 0;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden animate-[fadeIn_0.4s_ease-out]">
      <div className="flex shrink-0 items-center justify-between border-b border-ithina-border/40 px-7 pb-4 pt-5">
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
              {t.count != null ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                    tab === t.id ? "bg-white/20 text-white" : "bg-amber-400/20 text-amber-400",
                  )}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {tab === "pending" ? (
            <>
              {selectedIds.size > 0 ? (
                <span className="rounded bg-ithina-purple/10 px-2 py-1 text-[10px] font-semibold text-ithina-purple">
                  {selectedIds.size} selected
                </span>
              ) : null}
              <button
                type="button"
                disabled={bulkDisabled}
                onClick={bulkApprovePending}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  bulkDisabled
                    ? "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40"
                    : "cursor-pointer border-emerald-400/25 bg-emerald-400/10 text-emerald-400 hover:bg-emerald-500 hover:text-white",
                )}
              >
                <Check className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Approve All
              </button>
              <button
                type="button"
                disabled={bulkDisabled}
                onClick={bulkRejectPending}
                className={cn(
                  "inline-flex items-center gap-1 rounded border px-2.5 py-1.5 text-[10px] font-semibold transition-all",
                  bulkDisabled
                    ? "cursor-not-allowed border-ithina-border/40 text-slate-600 opacity-40"
                    : "cursor-pointer border-rose-400/20 text-rose-400 hover:bg-rose-500 hover:text-white",
                )}
              >
                <X className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                Reject All
              </button>
            </>
          ) : null}

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500"
              strokeWidth={2}
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "approved" ? (
          <PrototypeTabulator
            key="approved-table"
            columns={approvedColumns}
            data={approvedRowsFiltered}
            pagination
            pageSize={10}
            pageSizeSelector={false}
            tableHeight="100%"
            layout="fitColumns"
            onCellClick={(e) => {
              const target = e.target as HTMLElement | null;
              const actionEl = target?.closest?.("[data-action]") as HTMLElement | null;
              if (!actionEl) return;
            }}
            className="approval-queue-prototype border-none"
          />
        ) : tab === "all" ? (
          <PrototypeTabulator
            key="all-table"
            columns={allColumns}
            data={allRowsFiltered}
            pagination
            pageSize={10}
            pageSizeSelector={false}
            tableHeight="100%"
            layout="fitColumns"
            className="approval-queue-prototype border-none"
          />
        ) : (
          <>
            <PrototypeTabulator
              key="pending-table"
              columns={columns}
              data={filtered}
              pagination
              pageSize={10}
              pageSizeSelector={false}
              tableHeight="100%"
              layout="fitColumns"
              formatRevision={selectionRevision}
              rowFormatter={pendingRowFormatter}
              onCellClick={(e, row) => onAction(e, row)}
              headerCheckbox={{
                checked: allSelected,
                indeterminate: anySelected && !allSelected,
                onChange: toggleAll,
                selector: "[data-proto-header-checkbox='true']",
              }}
              className="approval-queue-prototype border-none"
            />
            <div className="flex shrink-0 items-center border-t border-ithina-border/40 bg-ithina-bg/40 px-6 py-2.5 text-xs text-slate-600">
              <span className="font-mono">
                {filtered.length} pending
                {selectedIds.size > 0 ? (
                  <span className="ml-2 text-ithina-purple">· {selectedIds.size} selected</span>
                ) : null}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

