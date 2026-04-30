import { Loader2, Save, LogOut, X } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  isSaving: boolean;
  onSaveAndLeave: () => void;
  onLeave: () => void;
  onStay: () => void;
}

export default function UnsavedChangesDialog({
  open,
  isSaving,
  onSaveAndLeave,
  onLeave,
  onStay,
}: UnsavedChangesDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onStay}
        aria-hidden
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-title"
        aria-describedby="unsaved-dialog-desc"
        className="relative z-10 w-full max-w-[380px] rounded-2xl border border-ithina-border bg-ithina-panel p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onStay}
          aria-label="Stay on page"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-500 transition-colors hover:text-white"
        >
          <X className="size-4" />
        </button>

        <div className="mb-1 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10">
            <Save className="size-4 text-amber-400" />
          </div>
          <h2 id="unsaved-dialog-title" className="text-sm font-bold text-white">
            Save campaign draft?
          </h2>
        </div>

        <p id="unsaved-dialog-desc" className="mb-5 mt-2 text-xs leading-relaxed text-slate-400">
          You have unsaved progress. Save now to continue later from where you left off, or leave without saving.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ithina-purple px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all hover:bg-ithina-purple-hover disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            {isSaving ? "Saving…" : "Save & Leave"}
          </button>

          <button
            type="button"
            onClick={onLeave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-ithina-border px-4 py-2.5 text-xs font-semibold text-slate-400 transition-all hover:border-rose-400/30 hover:bg-rose-400/5 hover:text-rose-300 disabled:opacity-60"
          >
            <LogOut className="size-3.5" />
            Leave without saving
          </button>

        </div>
      </div>
    </div>
  );
}
