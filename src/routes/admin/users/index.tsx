import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus } from "lucide-react";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import MainLayout from "@/components/layouts/main";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgUsers } from "@/queries/checker";
import type { AuthSessionUser } from "@/lib/auth/session";

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
  const { data: users = [], isLoading } = useOrgUsers();
  const [search, setSearch] = useState("");

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

  const columns: DataTableColumn<AuthSessionUser>[] = [
    {
      title: "User",
      field: "firstName",
      minWidth: 220,
      headerHozAlign: "left",
      hozAlign: "left",
      formatter: (cell: any) => {
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
      formatter: (cell: any) => {
        const role = cell.getValue() as AuthSessionUser["role"];
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getRoleBadgeClasses(role)}">${label}</span>`;
      },
    },
    {
      title: "Status",
      field: "isActive",
      width: 120,
      formatter: (cell: any) => {
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
      formatter: (cell: any) => {
        const dateVal = cell.getValue();
        if (!dateVal) return `<span class="text-muted-foreground">Never</span>`;
        const date = new Date(dateVal);
        return `<span class="text-sm text-muted-foreground">${formatDistanceToNow(date, { addSuffix: true })}</span>`;
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
          <Button variant="accent">
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
    </MainLayout>
  );
}
