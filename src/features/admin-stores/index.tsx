import { AlertCircle, Globe, MapPin, Pencil, Ruler, Search, Store, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminStores,
  useUpdateAdminStore,
  useUpdateAdminStoreActive,
  type StoreWithStaffCount,
} from "@/hooks/use-admin-stores";
import { cn } from "@/lib/utils";

import { AdminEditStoreModal, AdminStaffStoreModal } from "./admin-stores-modals";

const filterInputClass =
  "w-full min-w-0 rounded-md border border-ithina-border bg-ithina-bg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-ithina-purple focus:outline-none";

export default function AdminStoresPage() {
  const { data: stores = [], isLoading, isError, error } = useAdminStores();
  const updateStoreActiveMutation = useUpdateAdminStoreActive();
  const updateStoreMutation = useUpdateAdminStore();

  const [editStore, setEditStore] = useState<StoreWithStaffCount | null>(null);
  const [teamStore, setTeamStore] = useState<StoreWithStaffCount | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colName, setColName] = useState("");
  const [colAddress, setColAddress] = useState("");
  const [colRegion, setColRegion] = useState("");
  const [colStatus, setColStatus] = useState<"all" | "active" | "inactive">("all");
  const [colCurrency, setColCurrency] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return stores.filter((s) => {
      const matchGlobal =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.currency.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchName = !colName.trim() || s.name.toLowerCase().includes(colName.trim().toLowerCase());
      const matchAddr =
        !colAddress.trim() || s.address.toLowerCase().includes(colAddress.trim().toLowerCase());
      const matchRegion =
        !colRegion.trim() || s.region.toLowerCase().includes(colRegion.trim().toLowerCase());
      const matchStatus =
        colStatus === "all" ||
        (colStatus === "active" && s.is_active) ||
        (colStatus === "inactive" && !s.is_active);
      const matchCur =
        !colCurrency.trim() || s.currency.toLowerCase().includes(colCurrency.trim().toLowerCase());
      return matchGlobal && matchName && matchAddr && matchRegion && matchStatus && matchCur;
    });
  }, [stores, search, colName, colAddress, colRegion, colStatus, colCurrency]);

  const columns = useMemo<IthColumnDef<StoreWithStaffCount>[]>(
    () => [
      {
        key: "no",
        label: "No.",
        width: "w-[52px]",
        render: (_row, index) => (
          <span className="font-mono text-xs text-slate-500">{(page - 1) * pageSize + index + 1}</span>
        ),
      },
      {
        key: "store",
        label: "Store details",
        sortable: true,
        field: "name",
        render: (row) => (
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-ithina-purple/25 bg-ithina-purple/10">
              <Store className="size-4 text-ithina-purple" aria-hidden />
            </div>
            <IthPrimaryCell primary={row.name} secondary={`ID: ${row.id}`} />
          </div>
        ),
      },
      {
        key: "address",
        label: "Address",
        sortable: true,
        field: "address",
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-300">
            <MapPin className="size-3.5 shrink-0 text-slate-500" aria-hidden />
            {row.address}
          </span>
        ),
      },
      {
        key: "region",
        label: "Region",
        sortable: true,
        field: "region",
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        field: "is_active",
        render: (row) => (
          <IthBadge
            label={row.is_active ? "Active" : "Inactive"}
            variant={row.is_active ? "emerald" : "slate"}
            dot={row.is_active}
          />
        ),
      },
      {
        key: "currency",
        label: "Currency",
        sortable: true,
        field: "currency",
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-300">
            <Globe className="size-3.5 shrink-0 text-slate-500" aria-hidden />
            {row.currency}
          </span>
        ),
      },
      {
        key: "dimensions",
        label: "Dimensions",
        render: () => (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-slate-500">
            <Ruler className="size-3.5 shrink-0" aria-hidden />
            —
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "min-w-[120px]",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Edit store"
              onClick={(e) => {
                e.stopPropagation();
                setEditStore(row);
              }}
              className="rounded-lg border border-ithina-border p-2 text-slate-300 transition-colors hover:border-ithina-purple/40 hover:bg-ithina-purple/10 hover:text-white"
              aria-label="Edit"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              title="Manage store staff"
              onClick={(e) => {
                e.stopPropagation();
                setTeamStore(row);
              }}
              className="rounded-lg border border-ithina-border p-2 text-slate-300 transition-colors hover:border-ithina-purple/40 hover:bg-ithina-purple/10 hover:text-white"
              aria-label="Manage store staff"
            >
              <Users className="size-3.5" />
            </button>
            <button
              type="button"
              title={row.is_active ? "Deactivate store" : "Store inactive"}
              disabled={!row.is_active || updateStoreActiveMutation.isPending}
              onClick={(e) => {
                e.stopPropagation();
                if (!row.is_active) return;
                if (
                  !window.confirm(
                    `Deactivate "${row.name}"? You can reactivate it later from this list.`,
                  )
                )
                  return;
                updateStoreActiveMutation.mutate({ storeId: row.id, is_active: false });
              }}
              className="rounded-lg border border-rose-400/25 bg-rose-400/5 p-2 text-rose-400 transition-colors hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Deactivate store"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [page, pageSize, updateStoreActiveMutation.isPending],
  );

  const filterRow = useMemo(
    () => [
      <span key="f-no" className="block h-8" aria-hidden />,
      <input
        key="f-name"
        type="text"
        value={colName}
        onChange={(e) => {
          setColName(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by store name"
      />,
      <input
        key="f-addr"
        type="text"
        value={colAddress}
        onChange={(e) => {
          setColAddress(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by address"
      />,
      <input
        key="f-region"
        type="text"
        value={colRegion}
        onChange={(e) => {
          setColRegion(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by region"
      />,
      <select
        key="f-status"
        value={colStatus}
        onChange={(e) => {
          setColStatus(e.target.value as "all" | "active" | "inactive");
          setPage(1);
        }}
        className={cn(filterInputClass, "cursor-pointer")}
        aria-label="Filter by status"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>,
      <input
        key="f-cur"
        type="text"
        value={colCurrency}
        onChange={(e) => {
          setColCurrency(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by currency"
      />,
      <span key="f-dim" className="block h-8" aria-hidden />,
      <span key="f-act" className="block h-8" aria-hidden />,
    ],
    [colName, colAddress, colRegion, colStatus, colCurrency],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="ithina-page flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="ithina-page-inner flex min-h-0 flex-1 flex-col gap-4 pb-10 pt-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or address…"
              className="w-full rounded-xl border border-ithina-border bg-ithina-panel py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
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
            <IthTable<StoreWithStaffCount>
              data={filtered}
              columns={columns}
              rowKey={(s) => s.id}
              filterRow={filterRow}
              pagination={{
                page,
                pageSize,
                total: filtered.length,
                onPageChange: setPage,
                layout: "full",
                onPageSizeChange: (n) => {
                  setPageSize(n);
                  setPage(1);
                },
                pageSizeOptions: [10, 25, 50],
              }}
              empty={{
                icon: <Store className="size-5 text-slate-600" />,
                message: "No stores match your filters.",
              }}
            />
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
