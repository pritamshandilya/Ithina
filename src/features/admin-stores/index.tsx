import { AlertCircle, Ruler, Search, Store } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminStores,
  useUpdateAdminStore,
  useUpdateAdminStoreActive,
  type StoreWithStaffCount,
} from "@/hooks/use-admin-stores";

import { AdminEditStoreModal, AdminStaffStoreModal } from "./admin-stores-modals";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function AdminStoresPage() {
  const { data: stores = [], isLoading, isError, error } = useAdminStores();
  const updateStoreActiveMutation = useUpdateAdminStoreActive();
  const updateStoreMutation = useUpdateAdminStore();

  const [editStore, setEditStore] = useState<StoreWithStaffCount | null>(null);
  const [teamStore, setTeamStore] = useState<StoreWithStaffCount | null>(null);

  const setEditRef = useRef(setEditStore);
  const setTeamRef = useRef(setTeamStore);
  const mutationRef = useRef(updateStoreActiveMutation);
  useEffect(() => {
    setEditRef.current = setEditStore;
    setTeamRef.current = setTeamStore;
    mutationRef.current = updateStoreActiveMutation;
  }, [setEditStore, setTeamStore, updateStoreActiveMutation]);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stores;
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.currency.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [stores, search]);

  const columns = useMemo<DataTableColumn<StoreWithStaffCount>[]>(
    () => [
      {
        title: "Store Details",
        field: "name",
        minWidth: 200,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const d = rowData as StoreWithStaffCount;
          return (
            d.name.toLowerCase().includes(term) || d.id.toLowerCase().includes(term)
          );
        },
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const row = cell.getData();
          const storeIcon = renderToStaticMarkup(
            <Store className="size-5 text-primary" strokeWidth={2} aria-hidden />,
          );
          const name = escapeHtml(row.name);
          const idShort = escapeHtml(row.id.slice(0, 8));
          return `
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/20 text-primary shadow-inner shadow-black/10">
                ${storeIcon}
              </div>
              <div class="text-left">
                <p class="font-semibold leading-tight text-foreground">${name}</p>
                <p class="text-[10px] uppercase tracking-widest text-muted-foreground opacity-70">ID: ${idShort}</p>
              </div>
            </div>`;
        },
      },
      {
        title: "Address",
        field: "address",
        minWidth: 250,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const value = escapeHtml(String(cell.getValue() ?? "—"));
          const pinIcon = renderToStaticMarkup(
            <svg className="size-3.5 shrink-0 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
          );
          return `
            <div class="flex items-center gap-2 text-muted-foreground">
              ${pinIcon}
              <span class="text-sm truncate">${value}</span>
            </div>`;
        },
      },
      {
        title: "Region",
        field: "region",
        width: 130,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const value = escapeHtml(String(cell.getValue() ?? "—"));
          return `<span class="text-sm text-muted-foreground">${value}</span>`;
        },
      },
      {
        title: "Status",
        field: "is_active",
        width: 120,
        headerFilter: "list" as const,
        headerFilterParams: {
          values: { "": "All", "true": "Active", "false": "Inactive" },
        },
        headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
          const v = value as string | boolean | undefined;
          if (v === "" || v === undefined || v === null) return true;
          const row = rowData as StoreWithStaffCount;
          if (v === true || v === "true") return row.is_active === true;
          if (v === false || v === "false") return row.is_active === false;
          return true;
        },
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const active = Boolean(cell.getValue());
          const statusClass = active
            ? "border-emerald-500/30 text-emerald-500"
            : "border-destructive/30 text-destructive";
          const label = active ? "Active" : "Inactive";
          return `<span class="inline-flex rounded border px-1.5 py-0.5 text-xs ${statusClass}">${label}</span>`;
        },
      },
      {
        title: "Currency",
        field: "currency",
        width: 130,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const globeIcon = renderToStaticMarkup(
            <svg className="size-3 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
          );
          const cur = escapeHtml(String(cell.getValue() ?? "USD"));
          return `
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
              ${globeIcon}
              <span>${cur}</span>
            </div>`;
        },
      },
      {
        title: "Dimensions",
        field: "dimensions",
        headerSort: false,
        headerFilter: false,
        width: 140,
        formatter: () => {
          const rulerIcon = renderToStaticMarkup(
            <Ruler className="size-3 opacity-70" aria-hidden />,
          );
          return `
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
              ${rulerIcon}
              <span>Metric</span>
            </div>`;
        },
      },
      {
        title: "Actions",
        field: "actions",
        headerSort: false,
        headerFilter: false,
        width: 100,
        hozAlign: "right",
        headerHozAlign: "right",
        formatter: (cell: DataTableCell<StoreWithStaffCount>) => {
          const row = cell.getData();
          const canDeactivate = row.is_active;
          return `
            <div class="flex items-center justify-end gap-1">
              <button type="button" data-action="edit" class="edit-btn inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-slate-400 transition-all hover:border-primary/40 hover:bg-white/[0.06] hover:text-white" aria-label="Edit store">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button type="button" data-action="team" class="staff-btn inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-slate-400 transition-all hover:border-primary/40 hover:bg-white/[0.06] hover:text-white" aria-label="Manage staff">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </button>
              <button type="button" data-action="deactivate" class="delete-btn inline-flex size-8 items-center justify-center rounded-md border border-rose-400/25 bg-transparent text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40" ${canDeactivate ? "" : "disabled"} aria-label="Deactivate store">
                <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>`;
        },
        cellClick: (_e: MouseEvent, cell: DataTableCell<StoreWithStaffCount>) => {
          const t = (_e.target as HTMLElement).closest("button");
          if (!t) return;
          const row = cell.getData();
          if (t.classList.contains("edit-btn")) {
            setEditRef.current(row);
            return;
          }
          if (t.classList.contains("staff-btn")) {
            setTeamRef.current(row);
            return;
          }
          if (t.classList.contains("delete-btn") && row.is_active) {
            if (!window.confirm(`Deactivate "${row.name}"? You can reactivate it later from this list.`)) return;
            mutationRef.current.mutate({ storeId: row.id, is_active: false });
          }
        },
      },
    ],
    [],
  );

  return (
    <div className="flex w-full min-w-0 flex-col bg-ithina-bg">
      <div className="ithina-page w-full flex flex-col">
        <div className="mx-auto w-full max-w-screen-2xl space-y-4 px-4 pb-10 pt-4 lg:px-8">
            <div className="group relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or address..."
                className="h-12 w-full rounded-md border border-input bg-card py-2 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring/30"
                aria-label="Search stores"
              />
            </div>

            {isLoading && (
              <div className="space-y-3 rounded-xl border border-ithina-border/40 bg-ithina-panel/20 p-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full rounded-md" />
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/5 px-6 py-4 text-rose-300">
                <AlertCircle className="size-5 shrink-0" />
                <span className="text-sm">{(error as Error)?.message ?? "Failed to load stores"}</span>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="min-w-0">
                <DataTable<StoreWithStaffCount>
                  data={filtered}
                  columns={columns}
                  rowIdField="id"
                  pagination
                  pageSize={10}
                  pageSizeSelector={[5, 10, 20, 50]}
                  emptyMessage="No stores found matching your criteria"
                  headerFilters
                />
              </div>
            )}
        </div>
      </div>

      <AdminEditStoreModal
        store={editStore}
        onClose={() => {
          updateStoreMutation.reset();
          setEditStore(null);
        }}
        isPending={updateStoreMutation.isPending}
        error={updateStoreMutation.error as Error | null}
        onSave={(payload) => {
          if (!editStore) return;
          updateStoreMutation.mutate(
            { storeId: editStore.id, payload },
            { onSuccess: () => setEditStore(null) },
          );
        }}
      />

      <AdminStaffStoreModal store={teamStore} onClose={() => setTeamStore(null)} />
    </div>
  );
}
