import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgUsers, useInviteUser, useUpdateUser, useDeactivateUser } from "@/queries/checker";
import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import type { AuthSessionUser } from "@/lib/auth/session";
import type { UpsertUserPayload } from "@/queries/checker/api/org";
import { renderToStaticMarkup } from "react-dom/server";
import {
  type DataTableCell,
} from "@/components/ui/data-table";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

function getRoleBadgeClasses(role: AuthSessionUser["role"]) {
  if (role === "admin") {
    return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  }
  if (role === "checker") {
    return "bg-accent/15 text-accent border-accent/30";
  }
  return "bg-blue-500/15 text-blue-500 border-blue-500/30";
}

function AdminUsersPage() {
  const { toast } = useToast();
  const { data: users = [], isLoading } = useOrgUsers();
  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();
  const deactivateUserMutation = useDeactivateUser();

  const [search, setSearch] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"invite" | "edit">("invite");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AuthSessionUser | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.trim();
      const query = search.toLowerCase();
      return (
        fullName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const handleInvite = async (payload: UpsertUserPayload) => {
    try {
      await inviteUserMutation.mutateAsync(payload);
      setIsFormModalOpen(false);
      toast({ title: "Invitation Sent", description: `A login invitation has been sent to ${payload.email}.` });
    } catch (_err) {
      toast({ title: "Error", description: "Failed to send invitation.", variant: "destructive" });
    }
  };

  const handleEdit = async (payload: UpsertUserPayload) => {
    if (!selectedUser) return;
    try {
      await updateUserMutation.mutateAsync({ userId: selectedUser.id, payload });
      setIsFormModalOpen(false);
      setSelectedUser(null);
      toast({ title: "User Updated", description: "The user has been updated successfully." });
    } catch (_err) {
      toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deactivateUserMutation.mutateAsync(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast({ title: "User Deactivated", description: "The user account has been disabled." });
    } catch (_err) {
      toast({ title: "Error", description: "Failed to deactivate user.", variant: "destructive" });
    }
  };

  const columns: DataTableColumn<AuthSessionUser>[] = [
    {
      title: "User",
      field: "firstName",
      minWidth: 220,
      headerHozAlign: "left",
      hozAlign: "left",
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const member = cell.getData() as AuthSessionUser;
        const initials = `${member.firstName?.[0] ?? "U"}${member.lastName?.[0] ?? "U"}`;
        return `
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent font-bold">
              ${initials}
            </div>
            <div class="text-left">
              <p class="font-semibold text-foreground">${member.firstName} ${member.lastName}</p>
              <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span class="truncate">${member.email}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    {
      title: "Role",
      field: "role",
      width: 150,
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const role = cell.getValue() as AuthSessionUser["role"];
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getRoleBadgeClasses(role)}">${label}</span>`;
      },
    },
    {
      title: "Status",
      field: "isActive",
      width: 120,
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const active = cell.getValue() as boolean;
        const statusCls = active ? "bg-chart-2" : "bg-muted-foreground/30";
        const textCls = active ? "text-chart-2" : "text-muted-foreground";
        return `
          <div class="flex items-center justify-center gap-1.5">
            <div class="size-2 rounded-full ${statusCls}"></div>
            <span class="text-xs font-semibold ${textCls}">${active ? "Active" : "Inactive"}</span>
          </div>
        `;
      },
    },
    {
      title: "Last Login",
      field: "lastLoginAt",
      width: 180,
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const dateVal = cell.getValue();
        if (typeof dateVal !== "string" || !dateVal) {
          return `<span class="text-muted-foreground">Never</span>`;
        }
        const date = new Date(dateVal);
        return `<span class="text-sm text-muted-foreground">${formatDistanceToNow(date, { addSuffix: true })}</span>`;
      },
    },
    {
      title: "Actions",
      field: "actions",
      width: 100,
      headerSort: false,
      hozAlign: "right",
      formatter: () => {
        const editBtn = renderToStaticMarkup(
          <IconButton
            type="button"
            className="edit-btn"
            variant="icon-ghost"
            size="icon-sm"
            aria-label="Edit user"
            icon={<Pencil size={16} aria-hidden />}
          />,
        );
        const deleteBtn = renderToStaticMarkup(
          <IconButton
            type="button"
            className="delete-btn"
            variant="destructive-ghost"
            size="icon-sm"
            aria-label="Delete user"
            icon={<Trash2 size={16} aria-hidden />}
          />,
        );

        return `<div class="flex items-center justify-end gap-1.5">${editBtn}${deleteBtn}</div>`;
      },
      cellClick: (e: unknown, cell: DataTableCell<AuthSessionUser>) => {
        const user = cell.getData() as AuthSessionUser;
        const target =
          e && typeof e === "object" && "target" in e && e.target instanceof Element
            ? e.target.closest("button")
            : null;
        if (target?.classList.contains("edit-btn")) {
          setSelectedUser(user);
          setFormMode("edit");
          setIsFormModalOpen(true);
        } else if (target?.classList.contains("delete-btn")) {
          setSelectedUser(user);
          setIsDeleteModalOpen(true);
        }
      },
    },
  ];

  return (
    <MainLayout
      pageHeader={
        <PageHeader
          title="Users"
          description="Manage organization users and role assignments."
        >
          <Button variant="accent" onClick={() => { setFormMode("invite"); setIsFormModalOpen(true); }}>
            <UserPlus className="mr-2 size-4" />
            Invite User
          </Button>
        </PageHeader>
      }
    >
      <div className="min-h-screen bg-primary pt-4 px-4 pb-8 lg:px-8">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6">
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    className="pl-10 bg-background/50 border-input text-foreground placeholder:text-muted-foreground/50 focus:ring-accent transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-background/50">
                    Role Filter
                  </Button>
                  <Button variant="outline" size="sm" className="bg-background/50">
                    Status Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="min-h-0 flex-1">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            ) : (
              <DataTable<AuthSessionUser>
                columns={columns}
                data={filteredUsers}
                pageSize={10}
                pageSizeSelector={[10, 20, 50]}
                emptyMessage="No users found matching your criteria"
              />
            )}
          </div>
        </div>
      </div>

      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={formMode === "edit" ? handleEdit : handleInvite}
        initialData={formMode === "edit" ? selectedUser || undefined : undefined}
        isLoading={inviteUserMutation.isPending || updateUserMutation.isPending}
        mode={formMode}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={deactivateUserMutation.isPending}
        title="Deactivate User"
        description={`Are you sure you want to deactivate "${selectedUser?.firstName} ${selectedUser?.lastName}"? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        variant="destructive"
      />
    </MainLayout>
  );
}
