import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Search,
  UserPlus
} from "lucide-react";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import MainLayout from "@/components/layouts/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared";
import { useOrgUsers } from "@/features/checker/hooks/useOrgData";
import type { AuthSessionUser } from "@/lib/auth/session";

export const Route = createFileRoute("/checker/org-staff")({
  component: OrgStaffPage,
});

function OrgStaffPage() {
  const { data: staff = [], isLoading } = useOrgUsers();
  const [search, setSearch] = useState("");

  const filteredStaff = useMemo(() => {
    return staff.filter(member =>
      `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      member.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [staff, search]);

  const columns: DataTableColumn<AuthSessionUser>[] = [
    {
      title: "Staff Member",
      field: "firstName",
      minWidth: 200,
      headerHozAlign: "left",
      hozAlign: "left",
      formatter: (cell: any) => {
        const member = cell.getData() as AuthSessionUser;
        const initials = `${member.firstName[0]}${member.lastName[0]}`;
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
      }
    },
    {
      title: "Role",
      field: "role",
      width: 150,
      formatter: (cell: any) => {
        const role = cell.getValue() as string;
        const cls = role === "checker"
          ? "bg-accent/15 text-accent border-accent/30"
          : "bg-blue-500/15 text-blue-500 border-blue-500/30";
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${cls}">${label}</span>`;
      }
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
      }
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
      }
    },
    {
      title: "Actions",
      field: "actions",
      width: 100,
      headerSort: false,
      formatter: () => {
        return `
                    <button class="p-1 hover:bg-accent/20 rounded-md transition-colors text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                `;
      }
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-primary pt-4 px-4 pb-8 lg:px-8">
        <div className="mx-auto w-full max-w-screen-2xl space-y-6">
          <PageHeader
            title="Staff Members"
            description="Manage access and roles for all users in your organization."
            icon={Users}
          >
            <Button variant="accent">
              <UserPlus className="mr-2 size-4" />
              Invite Staff
            </Button>
          </PageHeader>

          {/* Controls */}
          <Card className="bg-card border-border backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email or role..."
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

          {/* Staff Table */}
          <div className="min-h-0 flex-1">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
              </div>
            ) : (
              <DataTable<AuthSessionUser>
                columns={columns}
                data={filteredStaff}
                pageSize={10}
                pageSizeSelector={[10, 20, 50]}
                emptyMessage="No staff members found matching your criteria"
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
