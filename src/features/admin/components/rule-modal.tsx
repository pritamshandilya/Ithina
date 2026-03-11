import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NewRuleForm } from "@/types/admin";

interface RuleModalProps {
  form: NewRuleForm;
  onChange: (form: NewRuleForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function RuleModal({ form, onChange, onSave, onClose }: RuleModalProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ithina-bg/80 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add category override">
      <div className="flex w-full max-w-lg animate-[fadeIn_0.3s_ease-out] flex-col overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-2xl">
        <header className="flex items-center justify-between border-b border-ithina-border bg-white/[0.02] px-6 py-4">
          <h2 className="text-base font-bold text-white">Add Category Override</h2>
          <button onClick={onClose} aria-label="Close modal" className="text-slate-500 transition-colors hover:text-white">
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-4 bg-ithina-bg/50 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Category Name</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => onChange({ ...form, category: e.target.value })}
              placeholder="e.g. Cannabis, Pharmacy..."
              className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-ithina-border bg-ithina-panel p-3">
            <span className="text-xs font-medium text-slate-300">Allow Promotional Badges?</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={form.badge}
                onChange={(e) => onChange({ ...form, badge: e.target.checked })}
                className="peer sr-only"
              />
              <div
                className={cn(
                  "h-5 w-9 rounded-full after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white",
                  form.badge ? "bg-ithina-purple" : "bg-slate-700",
                )}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Price Display</label>
              <select
                value={form.priceDisplay}
                onChange={(e) => onChange({ ...form, priceDisplay: e.target.value })}
                className="w-full cursor-pointer appearance-none rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white focus:border-ithina-purple focus:outline-none"
              >
                <option>FULL</option>
                <option>POS_ONLY</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Color Restrict</label>
              <select
                value={form.colorRestrict}
                onChange={(e) => onChange({ ...form, colorRestrict: e.target.value })}
                className="w-full cursor-pointer appearance-none rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 text-sm text-white focus:border-ithina-purple focus:outline-none"
              >
                <option>None</option>
                <option>B&W Only</option>
                <option>State-specific</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Mandatory Disclaimer String</label>
            <input
              type="text"
              value={form.disclaimer}
              onChange={(e) => onChange({ ...form, disclaimer: e.target.value })}
              placeholder="e.g. Must be 21+"
              className="w-full rounded-lg border border-ithina-border bg-ithina-bg px-3 py-2 font-mono text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
            />
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-ithina-border bg-white/[0.02] p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-ithina-purple px-5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-ithina-purple-hover"
          >
            Save Override
          </button>
        </footer>
      </div>
    </div>
  );
}
