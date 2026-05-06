import { Search, Trash2, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DataTable,
  type DataTableCell,
  type DataTableColumn,
} from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { AuthSessionUser } from "@/lib/auth/session";
import type { Store } from "@/providers/store/types";
import {
  useAssignStoreUser,
  useOrgUsers,
  useRemoveStoreUser,
  useStoreUsers,
} from "@/queries/checker";

interface StoreUserAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export function StoreUserAssignmentModal({
  isOpen,
  onClose,
  store,
}: StoreUserAssignmentModalProps) {
  const { data: orgUsers = [], isLoading: isOrgUsersLoading } = useOrgUsers();
  const { data: storeUsers = [], isLoading: isStoreUsersLoading } =
    useStoreUsers(store?.id || "");
  const assignMutation = useAssignStoreUser();
  const removeMutation = useRemoveStoreUser();

  const [searchQuery, setSearchQuery] = useState("");

  const assignedUserIds = useMemo(
    () => new Set(storeUsers.map((u) => u.id)),
    [storeUsers],
  );

  const availableUsers = useMemo(() => {
    return orgUsers.filter(
      (user) =>
        !assignedUserIds.has(user.id) &&
        (user.role === "maker" || user.role === "checker") &&
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [orgUsers, assignedUserIds, searchQuery]);

  const handleAssign = async (userId: string) => {
    if (!store) return;
    try {
      await assignMutation.mutateAsync({ storeId: store.id, userId });
    } catch {
      // Assignment errors are surfaced via query layer or UI; no console logs.
    }
  };

  const handleRemove = async (userId: string) => {
    if (!store) return;
    try {
      await removeMutation.mutateAsync({ storeId: store.id, userId });
    } catch {
      // Removal errors are surfaced via query layer or UI; no console logs.
    }
  };

  if (!store) return null;

  const availableColumns: DataTableColumn<AuthSessionUser>[] = [
    {
      title: "User",
      field: "firstName",
      minWidth: 220,
      headerHozAlign: "left",
      hozAlign: "left",
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const user = cell.getData() as AuthSessionUser;
        const initials = `${user.firstName?.[0] ?? "U"}${user.lastName?.[0] ?? "U"}`;
        return `
                    <div class="flex items-center gap-3">
                        <div class="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                            ${initials}
                        </div>
                        <div class="min-w-0 text-left">
                            <p class="text-sm font-medium text-foreground truncate">${user.firstName} ${user.lastName}</p>
                            <p class="text-xs text-muted-foreground truncate">${user.email}</p>
                        </div>
                    </div>
                `;
      },
    },
    {
      title: "Role",
      field: "role",
      width: 120,
      formatter: (cell: DataTableCell<AuthSessionUser>) => {
        const role = cell.getValue() as AuthSessionUser["role"];
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border bg-muted/40 text-muted-foreground">${label}</span>`;
      },
    },
    {
      title: "Action",
      field: "actions",
      width: 90,
      headerSort: false,
      hozAlign: "right",
      formatter: () => {
        return `
                    <button class="assign-btn inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10">
                        Assign
                    </button>
                `;
      },
      cellClick: (_e, cell: DataTableCell<AuthSessionUser>) => {
        const user = cell.getData() as AuthSessionUser;
        void handleAssign(user.id);
      },
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-card border-border text-foreground glassmorphism flex max-h-[85vh] flex-col overflow-hidden rounded-xl border shadow-2xl">
        <div className="border-border bg-muted/20 flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <div className="bg-accent/20 rounded-md p-1.5">
              <UserPlus className="text-accent h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">
                Manage Store Staff
              </h3>
              <p className="text-muted-foreground text-xs">{store.name}</p>
            </div>
          </div>
          <IconButton
            type="button"
            variant="icon-ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
            icon={<X className="size-4" aria-hidden />}
          />
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <section>
            <h4 className="text-muted-foreground mb-3 text-sm font-bold tracking-wider uppercase">
              Assigned Staff
            </h4>
            {isStoreUsersLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : storeUsers.length === 0 ? (
              <p className="text-muted-foreground bg-muted/10 border-border rounded-lg border border-dashed p-4 text-sm italic">
                No users assigned to this store yet.
              </p>
            ) : (
              <div className="space-y-2">
                {storeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-background/50 border-border/50 group flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-accent/10 text-accent flex size-8 items-center justify-center rounded-full text-xs font-bold">
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-muted-foreground text-[10px] tracking-tight uppercase">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    {user.role !== "admin" && (
                      <IconButton
                        type="button"
                        variant="destructive-ghost"
                        size="icon-sm"
                        aria-label={`Remove ${user.firstName} ${user.lastName}`}
                        onClick={() => handleRemove(user.id)}
                        disabled={removeMutation.isPending}
                        icon={<Trash2 className="size-4" aria-hidden />}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-border border-t pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-muted-foreground text-sm font-bold tracking-wider uppercase">
                Available Staff
              </h4>
              <div className="relative w-48">
                <Search className="text-muted-foreground absolute top-1/2 left-2 size-3 -translate-y-1/2" />
                <Input
                  className="bg-muted/20 h-8 pl-8 text-xs"
                  placeholder="Find users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isOrgUsersLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : availableUsers.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm italic">
                No more staff members available to assign.
              </p>
            ) : (
              <DataTable<AuthSessionUser>
                className="min-h-0 flex-1"
                columns={availableColumns}
                data={availableUsers}
                pageSize={5}
                pageSizeSelector={[5, 10, 20]}
                emptyMessage="No more staff members available to assign."
              />
            )}
          </section>
        </div>

        <div className="border-border bg-muted/10 flex justify-end border-t p-4">
          <Button onClick={onClose} variant="outline" className="px-8">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
