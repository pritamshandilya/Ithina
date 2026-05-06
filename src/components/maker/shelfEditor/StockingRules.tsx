interface StockingRulesProps {
  rules: {
    highDemandProducts?: string[];
    restockThreshold?: number | string;
    notes?: string;
  };
}

export function StockingRules({ rules }: StockingRulesProps) {
  const highDemandSkus = rules?.highDemandProducts || [];
  const threshold = rules?.restockThreshold
    ? `${Number(rules.restockThreshold) * 100}%`
    : "30%";
  const policy =
    rules?.notes || "Restock when inventory falls below 30% of optimal level";

  return (
    <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl">
      <h3 className="mb-4 text-sm font-black tracking-widest text-white uppercase">
        Stocking Rules
      </h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-yellow-400" />
            <span className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
              High Demand
            </span>
          </div>
          <p className="text-xs font-medium text-slate-200">
            {highDemandSkus.length > 0 ? highDemandSkus.join(", ") : "None"}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-blue-400" />
            <span className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
              Restock Threshold
            </span>
          </div>
          <p className="text-xs font-medium text-slate-200">{threshold}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold tracking-tighter text-slate-400 uppercase">
              Inventory Policy
            </span>
          </div>
          <p className="text-xs leading-relaxed font-medium text-slate-200">
            {policy}
          </p>
        </div>
      </div>
    </div>
  );
}
