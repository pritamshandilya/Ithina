import { Plus } from "lucide-react";
import { memo, useMemo } from "react";

import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import type { ComplianceRule, GlobalDisplayRules } from "@/types/admin";
import { cn } from "@/lib/utils";

interface ComplianceTabProps {
  rules: ComplianceRule[];
  globalRules: GlobalDisplayRules;
  onGlobalChange: (rules: GlobalDisplayRules) => void;
  onOpenModal: () => void;
}

function ComplianceTab({ rules, globalRules, onGlobalChange, onOpenModal }: ComplianceTabProps) {
  const columns = useMemo<DataTableColumn<ComplianceRule>[]>(() => [
    {
      title: "Category",
      field: "category",
      minWidth: 140,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-medium text-white">${val}</span>`;
      },
    },
    {
      title: "Badge Allowed",
      field: "badge",
      width: 130,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => boolean }).getValue();
        const cls = val
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
          : "border-rose-400/20 bg-rose-400/10 text-rose-400";
        return `<span class="rounded border px-2 py-0.5 font-mono text-[10px] ${cls}">${val ? "TRUE" : "FALSE"}</span>`;
      },
    },
    {
      title: "Price Display",
      field: "priceDisplay",
      minWidth: 160,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="text-xs text-slate-300">${val}</span>`;
      },
    },
    {
      title: "Color Restrict",
      field: "colorRestrict",
      minWidth: 130,
      formatter: (cell: unknown) => {
        const val = (cell as { getValue: () => string }).getValue();
        return `<span class="font-mono text-[11px] text-slate-400">${val}</span>`;
      },
    },
    {
      title: "Special Rules",
      field: "special",
      minWidth: 200,
      hozAlign: "left",
      headerHozAlign: "left",
      formatter: (cell: unknown) => {
        const row = (cell as { getData: () => ComplianceRule }).getData();
        if (row.disclaimer) {
          return `<span class="inline-block rounded border border-slate-700 bg-black/30 px-2 py-0.5 font-mono text-[10px] text-white">"${row.disclaimer}"</span>`;
        }
        return `<span class="italic text-xs text-slate-400">${row.special}</span>`;
      },
    },
  ], []);

  return (
    <div className="flex animate-[fadeIn_0.3s_ease-out] flex-col gap-6">
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
        <DataTable<ComplianceRule>
          columns={columns}
          data={rules}
          rowIdField="category"
          emptyMessage="No compliance rules defined"
          pagination={false}
          headerFilters={false}
          showRowNumber
          layout="fitColumns"
        />
      </section>
    </div>
  );
}

export default memo(ComplianceTab);
