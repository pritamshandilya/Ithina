interface StockingRulesProps {
    rules: {
        highDemandProducts?: string[];
        restockThreshold?: number | string;
        notes?: string;
    };
}

export function StockingRules({ rules }: StockingRulesProps) {
    const highDemandSkus = rules?.highDemandProducts || [];
    const threshold = rules?.restockThreshold ? `${Number(rules.restockThreshold) * 100}%` : "30%";
    const policy = rules?.notes || "Restock when inventory falls below 30% of optimal level";

    return (
        <div className="mt-8 bg-slate-900/40 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Stocking Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-yellow-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">High Demand</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{highDemandSkus.length > 0 ? highDemandSkus.join(', ') : 'None'}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-blue-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Restock Threshold</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">{threshold}</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Inventory Policy</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">{policy}</p>
                </div>
            </div>
        </div>
    );
}
