import { AlertCircle, Pencil, Search, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminOrganizationUsers,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/use-admin-users";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { cn } from "@/lib/utils";

import { UserFormModal } from "./components/UserFormModal";
import type { OrgUser, UserFormData, UserRole } from "./types";

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  maker: "Maker",
  checker: "Checker",
};

const ROLE_BADGE_CLASS: Record<UserRole, string> = {
  admin: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  maker: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  checker: "border-ithina-purple/30 bg-ithina-purple/10 text-ithina-purple",
};

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

function userInitials(u: OrgUser): string {
  const a = u.firstName.trim().charAt(0) || "";
  const b = u.lastName.trim().charAt(0) || "";
  return (a + b).toUpperCase() || "?";
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest",
        ROLE_BADGE_CLASS[role],
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

const filterInputClass =
  "w-full min-w-0 rounded-md border border-ithina-border bg-ithina-bg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:border-ithina-purple focus:outline-none";

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError, error } = useAdminOrganizationUsers();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [colUser, setColUser] = useState("");
  const [colRole, setColRole] = useState("");
  const [colStatus, setColStatus] = useState("");
  const [colLogin, setColLogin] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      const matchesSearch =
        !term ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        ROLE_LABEL[u.role].toLowerCase().includes(term);
      const matchUser =
        !colUser.trim() ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(colUser.trim().toLowerCase()) ||
        u.email.toLowerCase().includes(colUser.trim().toLowerCase());
      const matchRole =
        !colRole.trim() || ROLE_LABEL[u.role].toLowerCase().includes(colRole.trim().toLowerCase());
      const matchColStatus =
        !colStatus.trim() ||
        u.status.toLowerCase().includes(colStatus.trim().toLowerCase());
      const loginStr = u.lastLoginAt ? formatRelativeTime(u.lastLoginAt) : "Never";
      const matchLogin =
        !colLogin.trim() || loginStr.toLowerCase().includes(colLogin.trim().toLowerCase());
      return (
        matchesRole &&
        matchesStatus &&
        matchesSearch &&
        matchUser &&
        matchRole &&
        matchColStatus &&
        matchLogin
      );
    });
  }, [users, search, roleFilter, statusFilter, colUser, colRole, colStatus, colLogin]);

  const columns = useMemo<IthColumnDef<OrgUser>[]>(
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
        key: "user",
        label: "User",
        sortable: true,
        field: "email",
        render: (row) => (
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ithina-border bg-ithina-panel text-[11px] font-bold text-slate-300">
              {userInitials(row)}
            </div>
            <IthPrimaryCell
              primary={`${row.firstName} ${row.lastName}`}
              secondary={row.email}
              secondaryMono={false}
            />
          </div>
        ),
      },
      {
        key: "role",
        label: "Role",
        sortable: true,
        field: "role",
        render: (row) => <RoleBadge role={row.role} />,
      },
      {
        key: "status",
        label: "Status",
        sortable: true,
        field: "status",
        render: (row) => (
          <IthBadge
            label={row.status === "active" ? "Active" : "Inactive"}
            variant={row.status === "active" ? "emerald" : "slate"}
            dot={row.status === "active"}
            pulse={row.status === "active"}
          />
        ),
      },
      {
        key: "lastLogin",
        label: "Last login",
        sortable: true,
        field: "lastLoginAt",
        render: (row) => (
          <span className="text-[13px] text-slate-400">
            {row.lastLoginAt ? formatRelativeTime(row.lastLoginAt) : "Never"}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "min-w-[88px]",
        render: (row) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              title="Edit user"
              onClick={() => setEditingUser(row)}
              className="rounded-lg border border-ithina-border p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label={`Edit ${row.firstName}`}
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              title="Remove user"
              disabled={deleteUser.isPending}
              onClick={() => {
                if (
                  !confirm(
                    `Remove ${row.firstName} ${row.lastName} from the organization? This cannot be undone.`,
                  )
                ) {
                  return;
                }
                deleteUser.mutate(row.id, {
                  onSuccess: () => {
                    toast({ title: "User removed", description: `${row.email} was removed.` });
                  },
                  onError: (e) => {
                    toast({
                      title: "Could not remove user",
                      description: (e as Error)?.message ?? "Please try again.",
                      variant: "destructive",
                    });
                  },
                });
              }}
              className="rounded-lg border border-rose-400/20 bg-rose-400/5 p-2 text-rose-400 transition-colors hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove ${row.firstName}`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [page, pageSize, deleteUser.isPending],
  );

  const filterRow = useMemo(
    () => [
      <span key="fn" className="block h-8" aria-hidden />,
      <input
        key="fu"
        type="text"
        value={colUser}
        onChange={(e) => {
          setColUser(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter users"
      />,
      <input
        key="fr"
        type="text"
        value={colRole}
        onChange={(e) => {
          setColRole(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by role"
      />,
      <input
        key="fs"
        type="text"
        value={colStatus}
        onChange={(e) => {
          setColStatus(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by status"
      />,
      <input
        key="fl"
        type="text"
        value={colLogin}
        onChange={(e) => {
          setColLogin(e.target.value);
          setPage(1);
        }}
        placeholder="Filter…"
        className={filterInputClass}
        aria-label="Filter by last login"
      />,
      <span key="fa" className="block h-8" aria-hidden />,
    ],
    [colUser, colRole, colStatus, colLogin],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="ithina-page flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="ithina-page-inner flex min-h-0 flex-1 flex-col gap-4 pb-10 pt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            <div className="relative min-h-[44px] flex-1">
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
                placeholder="Search by name, email, or role…"
                className="h-full min-h-[44px] w-full rounded-xl border border-ithina-border bg-ithina-panel py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
                aria-label="Search users"
              />
            </div>
            <div className="flex flex-wrap gap-2 lg:shrink-0">
              <label className="flex min-w-[140px] flex-1 flex-col gap-1 sm:min-w-[160px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  Role filter
                </span>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as RoleFilter);
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-ithina-border bg-ithina-panel px-3 text-sm text-white focus:border-ithina-purple focus:outline-none"
                >
                  <option value="all">All roles</option>
                  <option value="admin">Admin</option>
                  <option value="maker">Maker</option>
                  <option value="checker">Checker</option>
                </select>
              </label>
              <label className="flex min-w-[140px] flex-1 flex-col gap-1 sm:min-w-[160px]">
                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  Status filter
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as StatusFilter);
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-ithina-border bg-ithina-panel px-3 text-sm text-white focus:border-ithina-purple focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
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
              <span className="text-sm">{(error as Error)?.message ?? "Failed to load users"}</span>
            </div>
          )}

          {!isLoading && !isError && (
            <IthTable<OrgUser>
              data={filtered}
              columns={columns}
              rowKey={(u) => u.id}
              filterRow={filterRow}
              rowHighlight={(u) => (u.status === "inactive" ? "rose" : null)}
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
                icon: <Users className="size-5 text-slate-600" />,
                message: "No users match your criteria.",
              }}
            />
          )}
        </div>
      </div>

      {editingUser ? (
        <UserFormModal
          key={editingUser.id}
          editingUser={editingUser}
          onClose={() => setEditingUser(null)}
          isSubmitting={updateUser.isPending}
          onSave={async (data: UserFormData) => {
            try {
              await updateUser.mutateAsync({
                userId: editingUser.id,
                payload: {
                  first_name: data.firstName.trim(),
                  last_name: data.lastName.trim(),
                  email: data.email.trim().toLowerCase(),
                  role: data.role,
                  is_active: data.status === "active",
                  ...(data.password.trim() ? { password: data.password } : {}),
                },
              });
              toast({
                title: "User updated",
                description: `${data.firstName} ${data.lastName} has been saved.`,
              });
              setEditingUser(null);
            } catch (e) {
              toast({
                title: "Could not update user",
                description: (e as Error)?.message ?? "Please try again.",
                variant: "destructive",
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}
