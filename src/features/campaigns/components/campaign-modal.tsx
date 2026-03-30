import { X } from "lucide-react";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { CampaignCreateForm, CampaignListStatus } from "@/types/campaigns";

const STATUSES: CampaignListStatus[] = ["Draft", "Active", "Scheduled", "Completed", "Rejected"];

const HARDWARE_OPTIONS = ["Chroma 42", "Chroma 29", "LCD Banner", "E-Ink 13", "Video Wall"];

interface CampaignModalProps {
  mode: "create" | "edit";
  form: CampaignCreateForm;
  onChange: (form: CampaignCreateForm) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving?: boolean;
}

function CampaignModal({ mode, form, onChange, onSave, onClose, isSaving = false }: CampaignModalProps) {
  const title = mode === "create" ? "New Campaign" : "Edit Campaign";
  const saveLabel = mode === "create" ? "Create Campaign" : "Save Changes";

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex w-full max-w-lg animate-[fadeIn_0.3s_ease-out] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-2xl">
        <header className="flex items-center justify-between border-b border-ithina-border bg-white/[0.02] px-6 py-4">
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto bg-ithina-bg/50 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">
              Campaign Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              placeholder="e.g. Spring Produce Launch"
              className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => onChange({ ...form, status: e.target.value as CampaignListStatus })}
                className="w-full cursor-pointer appearance-none rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white focus:border-ithina-purple focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">SKUs</label>
              <input
                type="number"
                min={0}
                value={form.skus}
                onChange={(e) => onChange({ ...form, skus: Math.max(0, Number(e.target.value)) })}
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Hardware</label>
            <div className="flex flex-wrap gap-2 rounded-lg border border-ithina-border bg-ithina-bg p-2.5">
              {HARDWARE_OPTIONS.map((hw) => {
                const selected = form.hardware
                  .split(",")
                  .map((h) => h.trim())
                  .filter(Boolean)
                  .includes(hw);
                return (
                  <button
                    key={hw}
                    type="button"
                    onClick={() => {
                      const current = form.hardware
                        .split(",")
                        .map((h) => h.trim())
                        .filter(Boolean);
                      const next = selected
                        ? current.filter((h) => h !== hw)
                        : [...current, hw];
                      onChange({ ...form, hardware: next.join(", ") });
                    }}
                    className={cn(
                      "rounded border px-2 py-1 font-mono text-[10px] transition-all",
                      selected
                        ? "border-ithina-purple bg-ithina-purple/20 text-purple-300"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200",
                    )}
                  >
                    {hw}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-[10px] text-slate-500">Click to toggle hardware types</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Initiator</label>
              <input
                type="text"
                value={form.initiator}
                onChange={(e) => onChange({ ...form, initiator: e.target.value })}
                placeholder="e.g. Sarah J."
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Scheduled Date</label>
              <input
                type="text"
                value={form.scheduled_date}
                onChange={(e) => onChange({ ...form, scheduled_date: e.target.value })}
                placeholder="e.g. Mar 20 2026"
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 font-mono text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-ithina-border bg-white/[0.02] p-4">
          <p className="text-[10px] text-slate-500">
            {mode === "create" ? "Campaign saved as Draft by default." : "Only changed fields are updated."}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving || !form.name.trim()}
              className="rounded-lg bg-ithina-purple px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving…" : saveLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default memo(CampaignModal);
