import { Pencil, Plus, Search, UserX, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { IthBadge, IthPrimaryCell, IthTable, type IthColumnDef } from "@/components/ui/ith-table";
import { cn } from "@/lib/utils";
import { ConfirmDeactivateModal } from "./components/ConfirmDeactivateModal";
import { UserFormModal } from "./components/UserFormModal";
import type { OrgUser, UserFormData, UserRole } from "./types";

/* ─── Mock data ── */

const MOCK_USERS: OrgUser[] = [
  {
    id: "u-001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@displaydata.com",
    role: "maker",
    status: "active",
    storeIds: ["store-1", "store-2"],
    createdAt: "2026-01-10",
    lastLoginAt: "2026-03-30",
  },
  {
    id: "u-002",
    firstName: "Marcus",
    lastName: "Lee",
    email: "marcus@displaydata.com",
    role: "checker",
    status: "active",
    storeIds: ["store-1"],
    createdAt: "2026-01-15",
    lastLoginAt: "2026-03-29",
  },
  {
    id: "u-003",
    firstName: "David",
    lastName: "Kimani",
    email: "david@displaydata.com",
    role: "admin",
    status: "active",
    storeIds: [],
    createdAt: "2025-12-01",
    lastLoginAt: "2026-03-31",
  },
  {
    id: "u-004",
    firstName: "Priya",
    lastName: "Nair",
    email: "priya@displaydata.com",
    role: "maker",
    status: "active",
    storeIds: ["store-3"],
    createdAt: "2026-02-05",
    lastLoginAt: "2026-03-28",
  },
  {
    id: "u-005",
    firstName: "James",
    lastName: "Odhiambo",
    email: "james@displaydata.com",
    role: "maker",
    status: "inactive",
    storeIds: ["store-2"],
    createdAt: "2026-01-20",
    lastLoginAt: null,
  },
];

/* ─── Lookups ── */

const ROLE_BADGE_VARIANT: Record<UserRole, "rose" | "purple" | "emerald"> = {
  admin:   "rose",
  maker:   "purple",
  checker: "emerald",
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin:   "Admin",
  maker:   "Maker",
  checker: "Checker",
};

type RoleFilter = "all" | UserRole;

const ROLE_FILTERS: { key: RoleFilter; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "admin",   label: "Admin" },
  { key: "maker",   label: "Maker" },
  { key: "checker", label: "Checker" },
];

/* ─── Main component ── */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<OrgUser[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<OrgUser | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [users, search, roleFilter]);

  function handleOpenCreate() {
    setEditingUser(null);
    setShowUserModal(true);
  }

  function handleOpenEdit(user: OrgUser) {
    setEditingUser(user);
    setShowUserModal(true);
  }

  function handleSaveUser(data: UserFormData) {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role }
            : u,
        ),
      );
    } else {
      const newUser: OrgUser = {
        id: `u-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        status: "active",
        storeIds: [],
        createdAt: new Date().toISOString().split("T")[0],
        lastLoginAt: null,
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setShowUserModal(false);
    setEditingUser(null);
  }

  function handleDeactivate() {
    if (!deactivateTarget) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === deactivateTarget.id ? { ...u, status: "inactive" } : u)),
    );
    setDeactivateTarget(null);
  }

  const activeCount   = users.filter((u) => u.status === "active").length;
  const inactiveCount = users.filter((u) => u.status === "inactive").length;

  const columns = useMemo<IthColumnDef<OrgUser>[]>(
    () => [
      {
        key: "user",
        label: "User",
        sortable: true,
        render: (row) => (
          <IthPrimaryCell
            primary={`${row.firstName} ${row.lastName}`}
            secondary={`${row.email}  ·  Joined ${row.createdAt}${row.lastLoginAt ? `  ·  Last login ${row.lastLoginAt}` : "  ·  Never logged in"}`}
          />
        ),
      },
      {
        key: "role",
        label: "Role",
        width: "w-[120px]",
        render: (row) => (
          <IthBadge label={ROLE_LABEL[row.role]} variant={ROLE_BADGE_VARIANT[row.role]} />
        ),
      },
      {
        key: "status",
        label: "Status",
        width: "w-[120px]",
        render: (row) => (
          <IthBadge
            label={row.status}
            variant={row.status === "active" ? "emerald" : "slate"}
            dot={row.status === "active"}
            pulse={row.status === "active"}
          />
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        width: "w-[100px]",
        render: (row) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleOpenEdit(row); }}
              className="rounded-lg border border-ithina-border p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label={`Edit ${row.firstName}`}
              title="Edit user"
            >
              <Pencil className="size-3.5" />
            </button>

            {row.status === "active" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setDeactivateTarget(row); }}
                className="rounded-lg border border-ithina-rose/20 bg-ithina-rose/5 p-2 text-ithina-rose transition-colors hover:bg-ithina-rose/15"
                aria-label={`Deactivate ${row.firstName}`}
                title="Deactivate user"
              >
                <UserX className="size-3.5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl space-y-6 pb-10">

            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl border border-ithina-purple/25 bg-ithina-purple/10">
                  <Users className="size-4 text-ithina-purple" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-white">User Management</h1>
                  <p className="text-xs text-slate-500">
                    Invite, assign roles, and manage access for your organization.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-colors hover:bg-ithina-purple-hover"
              >
                <Plus className="size-4" />
                Invite User
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-ithina-border bg-ithina-panel p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-white">{users.length}</p>
                <p className="mt-1 text-xs text-slate-500">Total Users</p>
              </div>
              <div className="rounded-xl border border-ithina-emerald/20 bg-ithina-emerald/5 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-ithina-emerald">{activeCount}</p>
                <p className="mt-1 text-xs text-slate-500">Active</p>
              </div>
              <div className="rounded-xl border border-ithina-rose/20 bg-ithina-rose/5 p-4 text-center">
                <p className="text-2xl font-bold tabular-nums text-ithina-rose">{inactiveCount}</p>
                <p className="mt-1 text-xs text-slate-500">Inactive</p>
              </div>
            </div>

            {/* Filters + search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-xl border border-ithina-border bg-ithina-bg/40 p-1">
                {ROLE_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setRoleFilter(key); setPage(1); }}
                    className={cn(
                      "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all",
                      roleFilter === key ? "bg-ithina-purple text-white shadow-sm" : "text-slate-400 hover:text-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name or email…"
                  className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-ithina-purple focus:outline-none"
                />
              </div>
            </div>

            {/* Users table */}
            <IthTable<OrgUser>
              data={filtered}
              columns={columns}
              rowKey={(u) => u.id}
              rowHighlight={(u) => (u.status === "inactive" ? "rose" : null)}
              pagination={{
                page,
                pageSize: 10,
                total: filtered.length,
                onPageChange: setPage,
              }}
              empty={{
                icon: <Users className="size-5 text-slate-600" />,
                message: "No users found matching your criteria.",
              }}
            />
          </div>
        </div>
      </div>

      {showUserModal && (
        <UserFormModal
          editingUser={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {deactivateTarget && (
        <ConfirmDeactivateModal
          user={deactivateTarget}
          onConfirm={handleDeactivate}
          onClose={() => setDeactivateTarget(null)}
        />
      )}
    </>
  );
}
