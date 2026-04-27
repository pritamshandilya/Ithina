import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  adminManageStoreStaffKeys,
  adminStoresKeys,
  type StoreWithStaffCount,
} from "@/hooks/use-admin-stores";
import { organizationOverviewKeys } from "@/hooks/use-organization-overview";
import { storeSettingsKeys } from "@/hooks/use-store-settings";
import { storesKeys } from "@/hooks/use-stores";
import { cn } from "@/lib/utils";
import { listOrganizationUsers } from "@/services/admin-users";
import {
  assignUserToStore,
  listStoreUsers,
  removeUserFromStore,
  type StoreUser,
} from "@/services/stores";
import type { ApiUserResponse } from "@/types/api/users";

const filterInputClass =
  "w-full min-w-0 rounded-md border border-ithina-border bg-ithina-bg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-ithina-purple focus:outline-none";

function formatRoleLabel(role: string): string {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function isAssignableRole(role: ApiUserResponse["role"]): role is "maker" | "checker" {
  return role === "maker" || role === "checker";
}

interface AdminStaffStoreModalProps {
  store: StoreWithStaffCount | null;
  onClose: () => void;
}

export function AdminStaffStoreModal({ store, onClose }: AdminStaffStoreModalProps) {
  const storeId = store?.id ?? null;
  const qc = useQueryClient();

  const [availSearch, setAvailSearch] = useState("");
  const [availPage, setAvailPage] = useState(1);
  const [availPageSize, setAvailPageSize] = useState(5);
  const [colUser, setColUser] = useState("");
  const [colRole, setColRole] = useState("");

  useEffect(() => {
    setAvailSearch("");
    setAvailPage(1);
    setAvailPageSize(5);
    setColUser("");
    setColRole("");
  }, [storeId]);

  const orgUsersQuery = useQuery({
    queryKey: adminManageStoreStaffKeys.orgUsers,
    queryFn: listOrganizationUsers,
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

  const storeUsersQuery = useQuery({
    queryKey: adminManageStoreStaffKeys.storeUsers(storeId ?? ""),
    queryFn: () => listStoreUsers(storeId!),
    enabled: Boolean(storeId),
    staleTime: 15_000,
  });

  const invalidateStaffQueries = async () => {
    if (!storeId) return;
    await qc.invalidateQueries({ queryKey: adminManageStoreStaffKeys.storeUsers(storeId) });
    qc.invalidateQueries({ queryKey: adminStoresKeys.list });
    qc.invalidateQueries({ queryKey: storeSettingsKeys.staff(storeId) });
    qc.invalidateQueries({ queryKey: storesKeys.all });
    qc.invalidateQueries({ queryKey: organizationOverviewKeys.stats });
  };

  const assignMutation = useMutation({
    mutationFn: (userId: string) => assignUserToStore(storeId!, userId),
    onSuccess: invalidateStaffQueries,
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeUserFromStore(storeId!, userId),
    onSuccess: invalidateStaffQueries,
  });

  const assignedStaff = useMemo(() => {
    const rows = storeUsersQuery.data ?? [];
    return rows.filter((u): u is StoreUser & { role: "maker" | "checker" } => isAssignableRole(u.role));
  }, [storeUsersQuery.data]);

  const assignedIds = useMemo(() => new Set(assignedStaff.map((u) => u.id)), [assignedStaff]);

  const availablePool = useMemo(() => {
    const org = orgUsersQuery.data ?? [];
    const q = availSearch.trim().toLowerCase();
    return org.filter((u) => {
      if (!u.is_active || !isAssignableRole(u.role) || assignedIds.has(u.id)) return false;
      if (!q) return true;
      const hay = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
      return hay.includes(q);
    });
  }, [orgUsersQuery.data, assignedIds, availSearch]);

  const filteredAvailable = useMemo(() => {
    const uq = colUser.trim().toLowerCase();
    const rq = colRole.trim().toLowerCase();
    return availablePool.filter((u) => {
      const matchUser =
        !uq ||
        `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(uq);
      const matchRole = !rq || u.role.toLowerCase().includes(rq);
      return matchUser && matchRole;
    });
  }, [availablePool, colUser, colRole]);

  const assignError = assignMutation.error as Error | null;
  const removeError = removeMutation.error as Error | null;
  const mutationError = assignError ?? removeError;

  const availableColumns = useMemo<IthColumnDef<ApiUserResponse>[]>(
    () => [
      {
        key: "no",
        label: "No.",
        width: "w-[52px]",
        render: (_row, index) => (
          <span className="font-mono text-xs text-slate-500">
            {(availPage - 1) * availPageSize + index + 1}
          </span>
        ),
      },
      {
        key: "user",
        label: "User",
        sortable: true,
        field: "first_name",
        render: (row) => {
          const initials = `${row.first_name?.[0] ?? "U"}${row.last_name?.[0] ?? ""}`;
          return (
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ithina-purple/15 text-[11px] font-bold text-ithina-purple"
                aria-hidden
              >
                {initials}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-[13px] font-semibold text-white">
                  {row.first_name} {row.last_name}
                </p>
                <p className="truncate text-xs text-slate-500">{row.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        label: "Role",
        sortable: true,
        field: "role",
        render: (row) => (
          <span className="inline-flex rounded-md border border-ithina-border bg-ithina-bg/60 px-2 py-0.5 text-xs font-semibold capitalize text-slate-300">
            {formatRoleLabel(row.role)}
          </span>
        ),
      },
      {
        key: "action",
        label: "Action",
        align: "right",
        width: "min-w-[88px]",
        render: (row) => (
          <button
            type="button"
            className="text-xs font-semibold text-ithina-purple transition-colors hover:text-ithina-purple-hover hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            disabled={assignMutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
              assignMutation.mutate(row.id);
            }}
          >
            Assign
          </button>
        ),
      },
    ],
    [availPage, availPageSize, assignMutation.isPending],
  );

  const filterRow = useMemo(
    () => [
      <span key="f-no" className="block h-8" aria-hidden />,
      <input
        key="f-user"
        type="text"
        value={colUser}
        onChange={(e) => {
          setColUser(e.target.value);
          setAvailPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by user"
      />,
      <input
        key="f-role"
        type="text"
        value={colRole}
        onChange={(e) => {
          setColRole(e.target.value);
          setAvailPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by role"
      />,
      <span key="f-act" className="block h-8" aria-hidden />,
    ],
    [colUser, colRole],
  );

  if (!store) return null;

  const isStoreUsersLoading = storeUsersQuery.isLoading;
  const isOrgLoading = orgUsersQuery.isLoading;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-4 backdrop-blur-[6px] sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-manage-store-staff-title"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-panel/25 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ithina-purple/30 bg-ithina-purple/15">
              <UserPlus className="size-5 text-ithina-purple" aria-hidden />
            </div>
            <div>
              <h3
                id="admin-manage-store-staff-title"
                className="text-lg font-semibold tracking-tight text-white"
              >
                Manage Store Staff
              </h3>
              <p className="text-xs text-slate-500">{store.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          {mutationError ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {mutationError.message}
            </p>
          ) : null}

          <section>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned staff
            </h4>
            {isStoreUsersLoading ? (
              <Skeleton className="h-20 w-full rounded-lg" />
            ) : assignedStaff.length === 0 ? (
              <p className="rounded-lg border border-dashed border-ithina-border bg-ithina-bg/30 p-4 text-sm italic text-slate-500">
                No users assigned to this store yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {assignedStaff.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-ithina-border/60 bg-ithina-bg/30 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ithina-purple/15 text-[11px] font-bold text-ithina-purple">
                        {user.first_name?.[0] ?? "U"}
                        {user.last_name?.[0] ?? ""}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                          {formatRoleLabel(user.role)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      title={`Remove ${user.first_name} ${user.last_name}`}
                      aria-label={`Remove ${user.first_name} ${user.last_name}`}
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(user.id)}
                      className="rounded-lg border border-rose-400/25 p-2 text-rose-400 transition-colors hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border-t border-ithina-border/60 pt-6">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Available staff
              </h4>
              <div className="relative w-full sm:max-w-[220px]">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={availSearch}
                  onChange={(e) => {
                    setAvailSearch(e.target.value);
                    setAvailPage(1);
                  }}
                  placeholder="Find users…"
                  className={cn(
                    "h-9 w-full rounded-lg border border-ithina-border bg-ithina-panel py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600",
                    "focus:border-ithina-purple focus:outline-none focus:ring-2 focus:ring-ithina-purple/25",
                  )}
                  aria-label="Search available staff"
                />
              </div>
            </div>

            {isOrgLoading ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : filteredAvailable.length === 0 ? (
              <p className="py-6 text-center text-sm italic text-slate-500">
                No more staff members available to assign.
              </p>
            ) : (
              <IthTable<ApiUserResponse>
                data={filteredAvailable}
                columns={availableColumns}
                rowKey={(u) => u.id}
                filterRow={filterRow}
                pagination={{
                  page: availPage,
                  pageSize: availPageSize,
                  total: filteredAvailable.length,
                  onPageChange: setAvailPage,
                  layout: "full",
                  onPageSizeChange: (n) => {
                    setAvailPageSize(n);
                    setAvailPage(1);
                  },
                  pageSizeOptions: [5, 10, 20],
                }}
                empty={{
                  message: "No more staff members available to assign.",
                }}
              />
            )}
          </section>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-ithina-border bg-ithina-panel/20 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-ithina-border px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}
