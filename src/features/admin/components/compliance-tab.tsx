import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ComplianceRule, GlobalDisplayRules } from "@/types/admin";

interface ComplianceTabProps {
  rules: ComplianceRule[];
  globalRules: GlobalDisplayRules;
  onGlobalChange: (rules: GlobalDisplayRules) => void;
  onOpenModal: () => void;
}

export default function ComplianceTab({ rules, globalRules, onGlobalChange, onOpenModal }: ComplianceTabProps) {
  return (
    <div className="flex animate-[fadeIn_0.3s_ease-out] flex-col gap-6">
      {/* Global Display Rules */}
      <section className="rounded-xl border border-ithina-border bg-ithina-panel p-6 shadow-lg">
        <h3 className="mb-5 font-mono text-xs uppercase tracking-widest text-ithina-muted">Global Display Rules</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Minimum Margin Floor</label>
            <div className="relative">
              <input
                type="number"
                value={globalRules.minMarginFloor}
                onChange={(e) => onGlobalChange({ ...globalRules, minMarginFloor: Number(e.target.value) })}
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-2 pl-3 pr-8 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Min Font Size (OCR Gate)</label>
            <div className="relative">
              <input
                type="number"
                value={globalRules.minFontSize}
                onChange={(e) => onGlobalChange({ ...globalRules, minFontSize: Number(e.target.value) })}
                className="w-full rounded-lg border border-ithina-border bg-ithina-bg py-2 pl-3 pr-8 text-sm text-white transition-colors focus:border-ithina-purple focus:outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">pt</span>
            </div>
          </div>
          <div>
            <label className="mb-3 block text-xs font-medium text-slate-300">Discount % Visible</label>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={globalRules.discountVisible}
                onChange={(e) => onGlobalChange({ ...globalRules, discountVisible: e.target.checked })}
                className="peer sr-only"
              />
              <div className={cn(
                "h-5 w-9 rounded-full after:absolute after:left-[2px] after:top-[2px] after:size-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white",
                globalRules.discountVisible ? "bg-ithina-purple" : "bg-slate-700",
              )} />
              <span className="ml-3 text-xs font-medium text-slate-300">Allow AI to show "20% OFF"</span>
            </label>
          </div>
        </div>
      </section>

      {/* Category-Specific Overrides */}
      <section className="flex flex-col overflow-hidden rounded-xl border border-ithina-border bg-ithina-panel shadow-lg">
        <header className="flex items-center justify-between border-b border-ithina-border bg-white/[0.01] p-5">
          <h3 className="font-mono text-xs uppercase tracking-widest text-ithina-muted">Category-Specific Overrides</h3>
          <button
            onClick={onOpenModal}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
          >
            <Plus className="size-3.5" />
            New Override
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-ithina-bg/50">
              <tr className="border-b border-ithina-border font-mono text-[10px] uppercase tracking-widest text-slate-500">
                <th className="px-6 py-3 pl-8">Category</th>
                <th className="px-6 py-3 text-center">Badge Allowed</th>
                <th className="px-6 py-3">Price Display</th>
                <th className="px-6 py-3">Color Restrict</th>
                <th className="px-6 py-3">Special Rules</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ithina-border/50 text-sm">
              {rules.map((rule) => (
                <tr key={rule.category} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 pl-8 font-medium text-white">{rule.category}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 font-mono text-[10px]",
                        rule.badge
                          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                          : "border-rose-400/20 bg-rose-400/10 text-rose-400",
                      )}
                    >
                      {rule.badge ? "TRUE" : "FALSE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-300">{rule.priceDisplay}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-slate-400">{rule.colorRestrict}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">
                    {rule.disclaimer ? (
                      <span className="inline-block rounded border border-slate-700 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-white">
                        "{rule.disclaimer}"
                      </span>
                    ) : (
                      <span className="italic">{rule.special}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
