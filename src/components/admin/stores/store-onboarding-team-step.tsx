import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AuthSessionUser } from "@/lib/auth/session";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export interface StoreOnboardingTeamStepProps {
  hasStore: boolean;
  usersLoading: boolean;
  assignableUsers: AuthSessionUser[];
  selectedUserIds: Set<string>;
  isCreatingStore: boolean;
  onCreateStore: () => void | Promise<void>;
  isFinishing: boolean;
  onToggleUser: (userId: string) => void;
  onBulkSelectionChange: (userIds: string[], selected: boolean) => void;
  onFinish: () => void | Promise<void>;
}

export function StoreOnboardingTeamStep({
  hasStore,
  usersLoading,
  assignableUsers,
  selectedUserIds,
  isCreatingStore,
  onCreateStore,
  isFinishing,
  onToggleUser,
  onBulkSelectionChange,
  onFinish,
}: StoreOnboardingTeamStepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assignableUsers;

    return assignableUsers.filter((user) => {
      const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      const role = (user.role ?? "").toLowerCase();
      return fullName.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [assignableUsers, searchQuery]);

  const selectedCount = selectedUserIds.size;

  const allFilteredSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((user) => selectedUserIds.has(user.id));
  const someFilteredSelected = filteredUsers.some((user) =>
    selectedUserIds.has(user.id),
  );
  const headerCheckboxState: boolean | "indeterminate" =
    allFilteredSelected ? true : someFilteredSelected ? "indeterminate" : false;

  return (
    <Card className="border-border/60 bg-card/70 shadow-xl glassmorphism">
      <CardHeader>
        <CardTitle>Assign users to store</CardTitle>
        <CardDescription>
          Makers and checkers you select will have access to this store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          {!hasStore ? (
            <Button
              type="button"
              className="min-w-[160px]"
              disabled={isCreatingStore}
              onClick={() => void onCreateStore()}
            >
              {isCreatingStore ? "Creating..." : "Create store"}
            </Button>
          ) : (
            <Button
              variant="accent"
              type="button"
              className="min-w-[160px]"
              disabled={isFinishing}
              onClick={() => void onFinish()}
            >
              {isFinishing ? "Finishing..." : "Finish onboarding"}
            </Button>
          )}
        </div>

        {!hasStore ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create the store to assign makers and checkers.
            </p>
          </div>
        ) : usersLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : assignableUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No makers or checkers available to assign yet.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {selectedCount} user{selectedCount === 1 ? "" : "s"} selected
              </p>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or role"
                  className="pl-8"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-background/30">
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/70 text-muted-foreground backdrop-blur-sm">
                    <tr>
                      <th className="w-12 px-3 py-2 text-left font-medium">
                        <Checkbox
                          checked={headerCheckboxState}
                          disabled={filteredUsers.length === 0}
                          onCheckedChange={(value: boolean | "indeterminate") => {
                            const select = value === true;
                            onBulkSelectionChange(
                              filteredUsers.map((u) => u.id),
                              select,
                            );
                          }}
                          aria-label="Select all users in this list"
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-medium">Name</th>
                      <th className="px-3 py-2 text-left font-medium">Email</th>
                      <th className="px-3 py-2 text-left font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                          No users match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const selected = selectedUserIds.has(user.id);
                        return (
                          <tr
                            key={user.id}
                            className={`border-t border-border/70 transition-colors ${
                              selected ? "bg-accent/10" : "hover:bg-muted/40"
                            }`}
                          >
                            <td className="px-3 py-2">
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => onToggleUser(user.id)}
                                aria-label={`Select ${user.firstName} ${user.lastName}`}
                              />
                            </td>
                            <td className="px-3 py-2 font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{user.email}</td>
                            <td className="px-3 py-2 capitalize text-muted-foreground">
                              {user.role}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </CardContent>
    </Card>
  );
}

