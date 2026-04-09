import { Loader2, X } from "lucide-react";

import type { StoreWithStaffCount } from "@/hooks/use-admin-stores";
import type { StoreUser } from "@/services/stores";

interface AdminStaffStoreModalProps {
  store: StoreWithStaffCount | null;
  onClose: () => void;
  staffUserRows: StoreUser[];
  staffLoading: boolean;
}

export function AdminStaffStoreModal({
  store,
  onClose,
  staffUserRows,
  staffLoading,
}: AdminStaffStoreModalProps) {
  if (!store) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,8,20,0.93)] p-6 backdrop-blur-[6px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[20px] border border-ithina-border bg-ithina-sidebar shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-store-staff-title"
      >
        <header className="flex items-center justify-between border-b border-ithina-border px-7 py-5">
          <h3 id="admin-store-staff-title" className="text-base font-bold text-white">
            Staff — {store.name}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="min-h-[120px] px-7 py-6">
          {staffLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                <span className="font-mono text-ithina-purple">{staffUserRows.length}</span> user
                {staffUserRows.length === 1 ? "" : "s"} assigned to this store.
              </p>
              {staffUserRows.length > 0 ? (
                <ul className="max-h-48 overflow-y-auto rounded-lg border border-ithina-border bg-ithina-bg/40 px-3 py-2 font-mono text-xs text-slate-400">
                  {staffUserRows.map((u) => (
                    <li key={u.id}>{u.id}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
