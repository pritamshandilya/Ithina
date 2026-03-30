import { Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignableStoreUsers, useAssignStoreUser } from "@/hooks/use-store-settings";
import type { StoreProfile } from "@/types/store-settings";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  store: StoreProfile | null;
};

export function StoreStaffAssignmentSheet({ open, onOpenChange, store }: Props) {
  const {
    data: available = [],
    isLoading,
    isError,
  } = useAssignableStoreUsers({ enabled: open });
  const assignMutation = useAssignStoreUser();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return available;
    return available.filter((u) =>
      `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(s),
    );
  }, [available, q]);

  if (!store) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-ithina-border bg-ithina-sidebar sm:max-w-md"
      >
        <SheetHeader className="border-b border-ithina-border pb-4 text-left">
          <SheetTitle className="text-white">Manage store staff</SheetTitle>
          <SheetDescription className="text-slate-400">
            Assign makers and checkers to {store.name}.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or email"
              className="h-10 rounded-lg border-ithina-border bg-ithina-bg pl-9 text-sm text-white placeholder:text-slate-500 focus-visible:border-ithina-purple"
              aria-label="Search users"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full rounded-xl bg-ithina-border/40" />
                <Skeleton className="h-14 w-full rounded-xl bg-ithina-border/40" />
              </div>
            ) : isError ? (
              <p className="py-8 text-center text-sm text-rose-400">
                Could not load users. Please check your permissions and try again.
              </p>
            ) : available.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                All eligible users are already assigned to this store.
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No users match "{q}".
              </p>
            ) : (
              <ul className="space-y-2">
                {filtered.map((u) => {
                  const initials = `${u.firstName?.[0] ?? "U"}${u.lastName?.[0] ?? "U"}`;
                  const roleLabel = u.role.charAt(0).toUpperCase() + u.role.slice(1);
                  return (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-ithina-border bg-ithina-panel px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-ithina-purple/25 bg-ithina-purple/10 text-xs font-bold text-ithina-purple">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="truncate text-xs text-slate-500">{u.email}</p>
                          <span className="mt-0.5 inline-block rounded-md border border-ithina-border px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={assignMutation.isPending}
                        className="shrink-0 border-ithina-border bg-transparent text-ithina-purple hover:bg-ithina-purple/10 hover:text-white"
                        onClick={() => {
                          assignMutation.mutate(u.id, {
                            onSuccess: () => {
                              setQ("");
                            },
                          });
                        }}
                      >
                        <UserPlus className="size-3.5" aria-hidden />
                        Add
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
