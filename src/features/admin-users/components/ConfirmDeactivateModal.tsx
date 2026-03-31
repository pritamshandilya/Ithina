import { TriangleAlert, X } from "lucide-react";

import type { OrgUser } from "../types";

interface ConfirmDeactivateModalProps {
  user: OrgUser;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDeactivateModal({
  user,
  onConfirm,
  onClose,
}: ConfirmDeactivateModalProps) {
  const fullName = `${user.firstName} ${user.lastName}`;

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
        aria-labelledby="deactivate-modal-title"
      >
        <header className="flex items-start justify-between border-b border-ithina-border px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-ithina-rose/30 bg-ithina-rose/10">
              <TriangleAlert className="size-4 text-ithina-rose" />
            </div>
            <h3 id="deactivate-modal-title" className="text-base font-bold text-white">
              Remove User
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="px-7 py-6 text-center">
          <p className="text-sm text-slate-300">
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-white">{fullName}</span>?
          </p>
          <p className="mt-2 text-xs text-slate-500">
            They will lose access to the platform immediately. This can be reversed
            by reactivating the account.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-ithina-border px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border border-ithina-rose/30 bg-ithina-rose/10 px-5 py-2.5 text-sm font-bold text-ithina-rose transition-colors hover:bg-ithina-rose/20"
          >
            Deactivate User
          </button>
        </footer>
      </div>
    </div>
  );
}
