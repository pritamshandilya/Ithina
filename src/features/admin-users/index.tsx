import { AlertCircle, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableCell, type DataTableColumn } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminOrganizationUsers,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from "@/hooks/use-admin-users";
import { toast } from "@/hooks/use-toast";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { ROLE_LABEL, roleBadgePogTableClass } from "@/lib/role-badge-styles";

import { UserFormModal } from "./components/UserFormModal";
import type { OrgUser, UserFormData, UserRole } from "./types";

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | "active" | "inactive";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function userInitials(u: OrgUser): string {
  const a = u.firstName.trim().charAt(0) || "";
  const b = u.lastName.trim().charAt(0) || "";
  return (a + b).toUpperCase() || "?";
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError, error } = useAdminOrganizationUsers();
  const updateUser = useUpdateAdminUser();
  const deleteUser = useDeleteAdminUser();

  const [editingUser, setEditingUser] = useState<OrgUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const setEditingRef = useRef(setEditingUser);
  const deleteRef = useRef(deleteUser);
  useEffect(() => {
    setEditingRef.current = setEditingUser;
    deleteRef.current = deleteUser;
  }, [setEditingUser, deleteUser]);

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
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, search, roleFilter, statusFilter]);

  const columns = useMemo<DataTableColumn<OrgUser>[]>(
    () => [
      {
        title: "User",
        field: "firstName",
        minWidth: 220,
        sorter: "string" as const,
        headerHozAlign: "left",
        hozAlign: "left",
        headerFilter: "input" as const,
        headerFilterFunc: (value: unknown, _fieldVal: unknown, rowData: unknown) => {
          const term = String(value ?? "").trim().toLowerCase();
          if (!term) return true;
          const d = rowData as OrgUser;
          const hay = `${d.firstName} ${d.lastName} ${d.email} ${ROLE_LABEL[d.role]}`.toLowerCase();
          return hay.includes(term);
        },
        formatter: (cell: DataTableCell<OrgUser>) => {
          const row = cell.getData();
          const initials = escapeHtml(userInitials(row));
          const name = escapeHtml(`${row.firstName} ${row.lastName}`);
          const email = escapeHtml(row.email);
          return `
            <div class="flex items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/25 text-sm font-bold text-primary shadow-inner shadow-black/10">
                ${initials}
              </div>
              <div class="text-left">
                <p class="font-semibold leading-tight text-foreground">${name}</p>
                <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span class="truncate">${email}</span>
                </div>
              </div>
            </div>`;
        },
      },
      {
        title: "Role",
        field: "role",
        width: 150,
        headerFilter: "list" as const,
        headerFilterParams: {
          values: { "": "All", admin: "Admin", maker: "Maker", checker: "Checker" },
        },
        formatter: (cell: DataTableCell<OrgUser>) => {
          const role = String(cell.getValue() ?? "");
          const label = ROLE_LABEL[role] ?? role;
          return `<span class="${roleBadgePogTableClass(role)}">${escapeHtml(label)}</span>`;
        },
      },
      {
        title: "Status",
        field: "status",
        width: 120,
        headerFilter: "list" as const,
        headerFilterParams: {
          values: { "": "All", active: "Active", inactive: "Inactive" },
        },
        formatter: (cell: DataTableCell<OrgUser>) => {
          const active = cell.getValue() === "active";
          const statusCls = active ? "bg-chart-2" : "bg-muted-foreground/30";
          const textCls = active ? "text-chart-2" : "text-muted-foreground";
          const label = active ? "Active" : "Inactive";
          return `
            <div class="flex items-center justify-center gap-1.5">
              <div class="size-2 rounded-full ${statusCls}"></div>
              <span class="text-xs font-semibold ${textCls}">${label}</span>
            </div>`;
        },
      },
      {
        title: "Last Login",
        field: "lastLoginAt",
        width: 180,
        headerFilter: "input" as const,
        formatter: (cell: DataTableCell<OrgUser>) => {
          const v = cell.getValue();
          if (typeof v !== "string" || !v) {
            return `<span class="text-sm text-muted-foreground">Never</span>`;
          }
          const text = escapeHtml(formatRelativeTime(String(v)));
          return `<span class="text-sm text-muted-foreground">${text}</span>`;
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
        formatter: () =>
          `<div class="flex items-center justify-end gap-1.5">
            <button type="button" data-action="edit" class="edit-btn inline-flex size-8 items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-slate-400 transition-all hover:border-primary/40 hover:bg-white/[0.06] hover:text-white" aria-label="Edit user">
              <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button type="button" data-action="delete" class="delete-btn inline-flex size-8 items-center justify-center rounded-md border border-rose-400/25 bg-transparent text-rose-400 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white" aria-label="Delete user">
              <svg class="size-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>`,
        cellClick: (_e: MouseEvent, cell: DataTableCell<OrgUser>) => {
          const t = (_e.target as HTMLElement).closest("button");
          if (!t) return;
          const row = cell.getData();
          if (t.classList.contains("edit-btn")) {
            setEditingRef.current(row);
            return;
          }
          if (t.classList.contains("delete-btn")) {
            if (!confirm(`Remove ${row.firstName} ${row.lastName} from the organization? This cannot be undone.`)) return;
            deleteRef.current.mutate(row.id, {
              onSuccess: () => toast({ title: "User removed", description: `${row.email} was removed.` }),
              onError: (e) =>
                toast({ title: "Could not remove user", description: (e as Error)?.message ?? "Please try again.", variant: "destructive" }),
            });
          }
        },
      },
    ],
    [],
  );

  return (
    <div className="flex w-full min-w-0 flex-col bg-ithina-bg">
      <div className="ithina-page w-full flex flex-col">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6 px-4 pb-8 pt-4 lg:px-8">
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
              <div className="space-y-6">
                <div className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or role..."
                        className="h-10 w-full rounded-md border border-input bg-background/50 py-2 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                        aria-label="Search users"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full border-border bg-background/50 px-4 text-xs font-semibold"
                          >
                            Role Filter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setRoleFilter("all")}>All roles</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setRoleFilter("admin")}>Admin</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setRoleFilter("maker")}>Maker</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setRoleFilter("checker")}>Checker</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 rounded-full border-border bg-background/50 px-4 text-xs font-semibold"
                          >
                            Status Filter
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setStatusFilter("all")}>All statuses</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm backdrop-blur-sm">
                  <div className="pb-4">
                    <DataTable<OrgUser>
                      data={filtered}
                      columns={columns}
                      rowIdField="id"
                      pagination
                      pageSize={10}
                      pageSizeSelector={[10, 20, 50]}
                      emptyMessage="No users found matching your criteria"
                      headerFilters
                      fitContent
                      className="rounded-none border-0"
                    />
                  </div>
                </div>
              </div>
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
