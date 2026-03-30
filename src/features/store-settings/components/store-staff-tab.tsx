import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useRemoveStoreUser, useStoreProfile, useStoreStaff } from "@/hooks/use-store-settings";
import type { StoreStaffMember } from "@/types/store-settings";

import { StoreStaffAssignmentSheet } from "./store-staff-assignment-sheet";

type Props = {
  canEdit?: boolean;
};

function staffColumns(canEdit: boolean, onRemove: (user: StoreStaffMember) => void): DataTableColumn<StoreStaffMember>[] {
  return [
    {
      title: "User",
      field: "firstName",
      minWidth: 220,
      headerSort: false,
      headerHozAlign: "left",
      hozAlign: "left",
      formatter: (cell) => {
        const member = (cell as { getData: () => StoreStaffMember }).getData();
        const initials = `${member.firstName?.[0] ?? "U"}${member.lastName?.[0] ?? "U"}`;
        return `
          <div class="flex items-center gap-3">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-full border border-ithina-purple/25 bg-ithina-purple/10 text-xs font-bold text-ithina-purple">
              ${initials}
            </div>
            <div class="min-w-0 text-left">
              <p class="text-sm font-semibold text-white">${member.firstName} ${member.lastName}</p>
              <p class="text-xs text-slate-500 truncate">${member.email}</p>
            </div>
          </div>
        `;
      },
    },
    {
      title: "Role",
      field: "role",
      width: 120,
      headerSort: false,
      formatter: (cell) => {
        const role = (cell as { getValue: () => string }).getValue() as StoreStaffMember["role"];
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        return `<span class="inline-flex items-center rounded-md border border-ithina-border bg-ithina-bg/60 px-2 py-0.5 text-xs font-semibold text-slate-400">${label}</span>`;
      },
    },
    ...(canEdit
      ? [
          {
            title: "Action",
            field: "id",
            width: 100,
            headerSort: false,
            headerHozAlign: "right" as const,
            hozAlign: "right" as const,
            formatter: (cell: unknown) => {
              const user = (cell as { getData: () => StoreStaffMember }).getData();
              if (user.role === "admin") return "";
              return `<button type="button" data-action="remove" class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/10">Remove</button>`;
            },
            cellClick: (_e: MouseEvent, cell: { getData: () => StoreStaffMember }) => {
              const user = cell.getData();
              if (user.role === "admin") return;
              const t = _e.target as HTMLElement;
              if (!t.closest("[data-action='remove']")) return;
              onRemove(user);
            },
          } satisfies DataTableColumn<StoreStaffMember>,
        ]
      : []),
  ];
}

export function StoreStaffTab({ canEdit = true }: Props) {
  const { data: profile } = useStoreProfile();
  const { data: staff = [], isLoading } = useStoreStaff();
  const { mutate: removeStaff } = useRemoveStoreUser();
  const [sheetOpen, setSheetOpen] = useState(false);

  const columns = useMemo(
    () => staffColumns(canEdit, (user) => removeStaff(user.id)),
    [canEdit, removeStaff],
  );

  return (
    <>
      <section className="rounded-2xl border border-ithina-border bg-ithina-panel p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="size-5 text-ithina-purple" aria-hidden />
              <h3 className="text-sm font-bold text-white">Staff Members</h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Makers and checkers assigned to this store.
            </p>
          </div>
          {canEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="border-ithina-border bg-transparent text-slate-300 hover:bg-ithina-purple/10 hover:text-white"
            >
              Manage store staff
            </Button>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-[220px] w-full rounded-xl bg-ithina-border/40" />
        ) : (
          <DataTable<StoreStaffMember>
            columns={columns}
            data={staff}
            rowIdField="id"
            headerFilters={false}
            showRowNumber={false}
            pagination
            pageSize={5}
            pageSizeSelector={[5, 10, 20]}
            layout="fitDataTable"
            emptyMessage="No users are currently assigned to this store."
            className="min-h-[220px] border-ithina-border bg-ithina-bg/30"
          />
        )}
      </section>

      <StoreStaffAssignmentSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        store={profile ?? null}
      />
    </>
  );
}
