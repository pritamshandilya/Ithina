import type { Dispatch, SetStateAction } from "react";

import { Maximize } from "lucide-react";

import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

interface StoreOnboardingDimensionSectionProps {
  dimensionUnits: string[];
  configForm: { default_dimensions: StoreDimensionUnit };
  setConfigForm: Dispatch<SetStateAction<{ default_dimensions: StoreDimensionUnit }>>;
}

export function StoreOnboardingDimensionSection({
  dimensionUnits,
  configForm,
  setConfigForm,
}: StoreOnboardingDimensionSectionProps) {
  return (
    <section className="rounded-xl bg-background/40 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Maximize className="size-4 text-accent" />
        <h3 className="text-sm font-semibold text-foreground">Dimension Units</h3>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Default dimension unit</p>
        <div className="grid grid-cols-3 gap-2">
          {dimensionUnits.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() =>
                setConfigForm({
                  default_dimensions: opt as StoreDimensionUnit,
                })
              }
              className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                configForm.default_dimensions === opt
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background/40 text-muted-foreground hover:border-accent/60"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
