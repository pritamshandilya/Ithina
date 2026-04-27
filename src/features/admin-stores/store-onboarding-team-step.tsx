import { ChevronLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { IthBadge } from "@/components/ui/ith-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrgUser } from "@/features/admin-users/types";

const ROLE_LABEL = { admin: "Admin", maker: "Maker", checker: "Checker" } as const;

function roleBadgeVariant(role: OrgUser["role"]): "amber" | "purple" | "emerald" {
  if (role === "admin") return "amber";
  if (role === "checker") return "emerald";
  return "purple";
}

interface StoreOnboardingTeamStepPromoProps {
  usersLoading: boolean;
  assignableUsers: OrgUser[];
  selectedUserIds: Set<string>;
  isFinishing: boolean;
  onToggleUser: (userId: string) => void;
  onBulkSelectionChange: (userIds: string[], selected: boolean) => void;
  onBack: () => void;
  onFinish: () => void;
}

export function StoreOnboardingTeamStepPromo({
  usersLoading,
  assignableUsers,
  selectedUserIds,
  isFinishing,
  onToggleUser,
  onBulkSelectionChange,
  onBack,
  onFinish,
}: StoreOnboardingTeamStepPromoProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return assignableUsers;
    return assignableUsers.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      const email = u.email.toLowerCase();
      const role = ROLE_LABEL[u.role].toLowerCase();
      return fullName.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [assignableUsers, searchQuery]);

  const selectedCount = selectedUserIds.size;
  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.has(u.id));
  const someFilteredSelected = filteredUsers.some((u) => selectedUserIds.has(u.id));
  const headerCheckboxState: boolean | "indeterminate" = allFilteredSelected
    ? true
    : someFilteredSelected
      ? "indeterminate"
      : false;

  return (
    <div className="rounded-xl border border-ithina-border bg-ithina-panel/90 shadow-xl">
      <div className="flex flex-col gap-4 border-b border-ithina-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-bold text-white">Assign users to store</h2>
          <p className="text-sm text-slate-500">
            Makers and checkers you select will have access to this store.
          </p>
        </div>
        <button
          type="button"
          onClick={onFinish}
          disabled={isFinishing}
          className="btn btn-primary shrink-0 self-start disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          {isFinishing ? "Finishing…" : "Finish onboarding"}
        </button>
      </div>

      <div className="space-y-4 px-6 py-6">
        {usersLoading ? (
          <Skeleton className="h-32 w-full rounded-lg" />
        ) : assignableUsers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No makers or checkers available to assign yet. Add users under Organization → Users.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {selectedCount} user{selectedCount === 1 ? "" : "s"} selected
              </p>
              <div className="relative w-full sm:w-80">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or role"
                  className="form-input pl-10"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-ithina-border">
              <table className="w-full border-collapse text-left">
                <thead className="bg-ithina-sidebar/80">
                  <tr className="border-b border-ithina-border">
                    <th className="w-12 px-3 py-2">
                      <input
                        type="checkbox"
                        className="admin-store-checkbox"
                        checked={headerCheckboxState === true}
                        ref={(el) => {
                          if (el) el.indeterminate = headerCheckboxState === "indeterminate";
                        }}
                        onChange={(e) => {
                          onBulkSelectionChange(
                            filteredUsers.map((u) => u.id),
                            e.target.checked,
                          );
                        }}
                        aria-label="Select all visible users"
                      />
                    </th>
                    <th className="th-base px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Name
                    </th>
                    <th className="th-base px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Email
                    </th>
                    <th className="th-base px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="tr-base">
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          className="admin-store-checkbox"
                          checked={selectedUserIds.has(u.id)}
                          onChange={() => onToggleUser(u.id)}
                          aria-label={`Select ${u.firstName} ${u.lastName}`}
                        />
                      </td>
                      <td className="td-base px-3 py-3 text-white">
                        <span className="font-medium">
                          {u.firstName} {u.lastName}
                        </span>
                      </td>
                      <td className="td-base px-3 py-3 font-mono text-[12px] text-slate-400">
                        {u.email}
                      </td>
                      <td className="td-base px-3 py-3">
                        <IthBadge label={ROLE_LABEL[u.role]} variant={roleBadgeVariant(u.role)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="flex justify-start pt-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isFinishing}
            className="btn btn-secondary gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
