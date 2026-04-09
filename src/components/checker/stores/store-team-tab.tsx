import { useMemo } from "react";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuthSessionUser } from "@/lib/auth/session";

interface StoreTeamTabProps {
  canEdit: boolean;
  storeId: string;
  storeUsers: AuthSessionUser[];
  storeUsersLoading: boolean;
  onManageStaff: () => void;
  onRemoveUser: (userId: string) => void;
}

export function StoreTeamTab({
  canEdit,
  storeId,
  storeUsers,
  storeUsersLoading,
  onManageStaff,
  onRemoveUser,
}: StoreTeamTabProps) {
  const userColumns: DataTableColumn<AuthSessionUser>[] = useMemo(
    () => [
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
              <div class="size-8 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                ${initials}
              </div>
              <div class="text-left">
                <p class="text-sm font-semibold text-foreground">${member.firstName} ${member.lastName}</p>
                <p class="text-xs text-muted-foreground truncate">${member.email}</p>
              </div>
            </div>
          `;
        },
      },
      {
        title: "Role",
        field: "role",
        width: 140,
        headerFilter: "list",
        headerFilterParams: {
          values: {
            "": "All",
            admin: "Admin",
            maker: "Maker",
            checker: "Checker",
          },
        },
        formatter: (cell: DataTableCell<AuthSessionUser>) => {
          const role = cell.getValue() as AuthSessionUser["role"];
          const label = role.charAt(0).toUpperCase() + role.slice(1);
          return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border bg-muted/40 text-muted-foreground">${label}</span>`;
        },
      },
    ],
    [canEdit, onRemoveUser, storeId],
  );

  return (
    <Card noBorder className="bg-card shadow-xl glassmorphism">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-accent" />
              <CardTitle>Staff Members</CardTitle>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Makers and checkers assigned to this store.
            </p>
          </div>
          {canEdit && (
            <Button type="button" variant="outline" size="sm" onClick={onManageStaff}>
              Manage store staff
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {storeUsersLoading ? (
          <Skeleton className="h-[200px] w-full rounded-lg" />
        ) : (
          <DataTable<AuthSessionUser>
            columns={userColumns}
            data={storeUsers}
            pageSize={5}
            pageSizeSelector={[5, 10, 20]}
            emptyMessage="No users are currently assigned to this store."
          />
        )}
      </CardContent>
    </Card>
  );
}
