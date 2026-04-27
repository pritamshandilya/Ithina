import { Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignableStoreUsers,
  useAssignStoreUser,
  useRemoveStoreUser,
  useStoreStaff,
} from "@/hooks/use-store-settings";
import type { StoreProfile, StoreStaffMember } from "@/types/store-settings";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreProfile | null;
};

function StaffRow({
  member,
  trailing,
  className,
  subtitle,
}: {
  member: StoreStaffMember;
  trailing: React.ReactNode;
  className?: string;
  /** e.g. email for “available” rows */
  subtitle?: string;
}) {
  const initials = `${member.firstName?.[0] ?? "U"}${member.lastName?.[0] ?? "U"}`;
  const roleUpper = member.role.toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-ithina-border/80 bg-ithina-bg/40 px-3 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ithina-purple/30 bg-ithina-purple/15 text-xs font-bold text-ithina-purple"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {member.firstName} {member.lastName}
          </p>
          {subtitle ? <p className="truncate text-xs text-slate-500">{subtitle}</p> : null}
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{roleUpper}</p>
        </div>
      </div>
      {trailing}
    </div>
  );
}

export function StoreStaffAssignmentSheet({ open, onOpenChange, store }: Props) {
  const { data: staff = [], isLoading: staffLoading } = useStoreStaff();
  const { data: available = [], isLoading: availableLoading } = useAssignableStoreUsers({ enabled: open });
  const assignMutation = useAssignStoreUser();
  const removeMutation = useRemoveStoreUser();
  const [q, setQ] = useState("");

  const busy = assignMutation.isPending || removeMutation.isPending;

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return available;
    return available.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(s),
    );
  }, [available, q]);

  if (!store) return null;

  const availableEmptyMessage =
    available.length === 0
      ? "No more staff members available to assign."
      : "No users match your search.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 sm:max-w-lg">
        <DialogHeader className="flex-row items-start gap-4 space-y-0">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-ithina-purple/35 bg-ithina-purple/15 text-ithina-purple">
            <UserPlus className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
            <DialogTitle>Manage Store Staff</DialogTitle>
            <DialogDescription className="text-slate-300">{store.name}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="max-h-[min(52vh,420px)] space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned staff</h4>
            {staffLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[68px] w-full rounded-xl bg-ithina-border/40" />
                <Skeleton className="h-[68px] w-full rounded-xl bg-ithina-border/40" />
              </div>
            ) : staff.length === 0 ? (
              <p className="py-2 text-sm italic text-slate-500">No one is assigned to this store yet.</p>
            ) : (
              <ul className="space-y-2">
                {staff.map((member) => (
                  <li key={member.id}>
                    <StaffRow
                      member={member}
                      trailing={
                        member.role === "admin" ? (
                          <span className="shrink-0 text-xs text-slate-600">—</span>
                        ) : (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => removeMutation.mutate(member.id)}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10 disabled:opacity-40"
                            aria-label={`Remove ${member.firstName} ${member.lastName}`}
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </button>
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Available staff</h4>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find users..."
                className="h-10 rounded-lg border-ithina-border bg-ithina-bg pl-9 text-sm text-white placeholder:text-slate-500 focus-visible:border-ithina-purple"
                aria-label="Find users"
              />
            </div>
            {availableLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[68px] w-full rounded-xl bg-ithina-border/40" />
                <Skeleton className="h-[68px] w-full rounded-xl bg-ithina-border/40" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-sm italic text-slate-500">{availableEmptyMessage}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((u) => (
                  <li key={u.id}>
                    <StaffRow
                      member={u}
                      subtitle={u.email}
                      trailing={
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          className="shrink-0 border-ithina-border bg-transparent text-ithina-purple hover:bg-ithina-purple/10 hover:text-white"
                          onClick={() => {
                            assignMutation.mutate(u.id, {
                              onSuccess: () => setQ(""),
                            });
                          }}
                        >
                          <UserPlus className="size-3.5" aria-hidden />
                          Add
                        </Button>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <DialogFooter className="bg-ithina-bg/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[96px] border-ithina-border bg-transparent font-semibold text-white hover:bg-ithina-panel"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
