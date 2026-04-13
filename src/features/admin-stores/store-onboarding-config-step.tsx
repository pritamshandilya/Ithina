import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pencil,
  Ruler,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ConfigTabId = "fixtures" | "shelves" | "compliance" | "dimensions";

const FIXTURES: { id: string; name: string; dims: string; meta: string }[] = [
  { id: "1", name: "Gondola", dims: "120×200×45 cm", meta: "Section · Aisle · Zone" },
  { id: "2", name: "Endcap", dims: "90×180×40 cm", meta: "Section · Aisle · Zone" },
  { id: "3", name: "Cooler / Chiller", dims: "200×220×80 cm", meta: "Section · Aisle · Zone" },
  { id: "4", name: "Checkout lane", dims: "100×80×50 cm", meta: "Section · Aisle · Zone" },
  { id: "5", name: "Wall unit", dims: "140×240×35 cm", meta: "Section · Aisle · Zone" },
];

interface ConfigNavItem {
  id: ConfigTabId;
  label: string;
  sub: string;
  icon: typeof Building2;
}

const NAV: ConfigNavItem[] = [
  { id: "fixtures", label: "Fixture Types", sub: "Layouts & placement", icon: Building2 },
  { id: "shelves", label: "Shelf Templates", sub: "Shelf defaults", icon: Layers },
  { id: "compliance", label: "Compliance Rules", sub: "Checks & thresholds", icon: Shield },
  { id: "dimensions", label: "Dimension Units", sub: "Measurement units", icon: Ruler },
];

interface StoreOnboardingConfigStepPromoProps {
  onBack: () => void;
  onNext: () => void;
  isCreating: boolean;
}

export function StoreOnboardingConfigStepPromo({
  onBack,
  onNext,
  isCreating,
}: StoreOnboardingConfigStepPromoProps) {
  const [tab, setTab] = useState<ConfigTabId>("dimensions");
  const [dimensionUnit, setDimensionUnit] = useState<"mm" | "cm" | "inch">("inch");

  return (
    <div className="rounded-xl border border-ithina-border bg-ithina-panel/90 shadow-xl">
      <div className="border-b border-ithina-border px-6 py-5">
        <h2 className="text-lg font-bold text-white">Store configuration</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review the default setup this store will use for fixtures, shelves, compliance rules, and
          measurement units.
        </p>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isCreating}
            className="btn btn-secondary gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={isCreating}
            className="btn btn-primary min-w-[160px] gap-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating…" : "Continue"}
            {!isCreating ? <ChevronRight className="size-4" aria-hidden /> : null}
          </button>
        </div>

        <div className="flex min-h-[280px] flex-col gap-4 rounded-xl border border-ithina-border/80 bg-ithina-bg/40 lg:flex-row">
          <div className="shrink-0 border-b border-ithina-border/60 p-4 lg:w-[260px] lg:border-b-0 lg:border-r">
            <p className="ithina-overline mb-3 px-1">Review configuration</p>
            <nav className="flex flex-col gap-1.5" aria-label="Configuration sections">
              {NAV.map((item) => {
                const Icon = item.icon;
                const active = tab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-ithina-purple/40 bg-ithina-purple/10 text-ithina-purple"
                        : "border-transparent bg-transparent text-slate-400 hover:border-ithina-border hover:bg-white/[0.03] hover:text-slate-200",
                    )}
                  >
                    <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span className="min-w-0 space-y-0.5">
                      <span className="block text-[13px] font-semibold leading-tight text-white">
                        {item.label}
                      </span>
                      <span className="block text-[11px] text-slate-500">{item.sub}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="min-w-0 flex-1 p-4 lg:p-5">
            {tab === "fixtures" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-ithina-purple" aria-hidden />
                    <h3 className="text-base font-semibold text-white">Fixture Types</h3>
                  </div>
                  <span className="badge badge-emerald">+ Add fixture</span>
                </div>
                <ul className="space-y-2">
                  {FIXTURES.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-ithina-border/60 bg-ithina-panel/60 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-white">{f.name}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">{f.dims}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{f.meta}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label={`Edit ${f.name}`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-2 text-slate-500 transition-colors hover:bg-ithina-rose/10 hover:text-ithina-rose"
                          aria-label={`Delete ${f.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500">
                  Example fixtures for onboarding preview. Promo does not persist fixture geometry
                  until the API supports it.
                </p>
              </div>
            )}

            {tab === "shelves" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="size-5 text-ithina-purple" aria-hidden />
                  <h3 className="text-base font-semibold text-white">Shelf Templates</h3>
                </div>
                <p className="text-sm text-slate-500">
                  Default shelf templates can be configured in the full POG app. Promo uses
                  organization defaults for new stores.
                </p>
              </div>
            )}

            {tab === "compliance" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="size-5 text-ithina-purple" aria-hidden />
                  <h3 className="text-base font-semibold text-white">Compliance Rules</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="form-group">
                    <label htmlFor="rule-name" className="form-label">
                      Name
                    </label>
                    <input
                      id="rule-name"
                      className="form-input"
                      defaultValue="Default Rule"
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rule-status" className="form-label">
                      Status
                    </label>
                    <select id="rule-status" className="form-input cursor-pointer" disabled>
                      <option>ACTIVE</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Visual compliance rules are illustrative only. Operational rules are managed in
                  POG.
                </p>
              </div>
            )}

            {tab === "dimensions" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler className="size-5 text-ithina-purple" aria-hidden />
                  <h3 className="text-base font-semibold text-white">Dimension Units</h3>
                </div>
                <p className="text-sm text-slate-500">
                  Choose the default unit for measurements in this store. This selection is for
                  display and does not change the create-store API payload yet.
                </p>
                <div className="form-group max-w-md">
                  <span className="form-label">Default dimension unit</span>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Default dimension unit"
                  >
                    {(
                      [
                        { id: "mm" as const, label: "mm" },
                        { id: "cm" as const, label: "cm" },
                        { id: "inch" as const, label: "inch" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={dimensionUnit === opt.id}
                        onClick={() => setDimensionUnit(opt.id)}
                        className={cn(
                          "min-w-[4rem] rounded-md border px-4 py-2.5 text-[13px] font-semibold transition-colors",
                          dimensionUnit === opt.id
                            ? "border-ithina-purple bg-ithina-purple/15 text-ithina-purple"
                            : "border-ithina-border bg-ithina-bg text-slate-400 hover:border-slate-500 hover:text-white",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
