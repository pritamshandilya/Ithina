import { cn } from "@/lib/utils";

interface ProductDataTableProps {
    products: Array<{
        sku: string;
        name: string;
        brand?: string;
        category: string;
        shelfNumber?: number;
        facings: number;
        depth: number;
        currentStock: number;
        optimalStock: number;
    }>;
}

export function ProductDataTable({ products }: ProductDataTableProps) {
    return (
        <div className="mt-8 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-900/40">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Product Details</h3>
                <div className="text-[10px] text-slate-500 font-bold tracking-tighter uppercase">{products.length} total SKUs</div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 capitalize border-b border-slate-800/50">
                            <th className="px-6 py-3 font-bold tracking-tighter">SKU</th>
                            <th className="px-6 py-3 font-bold tracking-tighter">Product</th>
                            <th className="px-6 py-3 font-bold tracking-tighter">Category</th>
                            <th className="px-6 py-3 font-bold tracking-tighter">Shelf</th>
                            <th className="px-6 py-3 font-bold tracking-tighter">Facings</th>
                            <th className="px-6 py-3 font-bold tracking-tighter text-center">Depth</th>
                            <th className="px-6 py-3 font-bold tracking-tighter text-center">Total Units</th>
                            <th className="px-6 py-3 font-bold tracking-tighter text-center">Stock</th>
                            <th className="px-6 py-3 font-bold tracking-tighter">Demand</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {products.map((p, idx) => (
                            <tr key={`${p.sku}-${idx}`} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-3.5 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">{p.sku}</td>
                                <td className="px-6 py-3.5">
                                    <div className="font-bold text-slate-200">{p.name}</div>
                                    <div className="text-[10px] text-slate-500 font-medium">{p.brand}</div>
                                </td>
                                <td className="px-6 py-3.5">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight",
                                        p.category === "Aperitif Snacks" ? "text-pink-400" :
                                            p.category === "Chips" ? "text-yellow-400" :
                                                p.category === "Snacks" ? "text-orange-400" :
                                                    p.category === "Kids Cereal" ? "text-orange-300" :
                                                        p.category === "Coffee" ? "text-orange-200" :
                                                            p.category === "Baby Care" ? "text-pink-300" :
                                                                p.category === "Grooming" ? "text-cyan-400" :
                                                                    "text-slate-400"
                                    )}>
                                        {p.category}
                                    </span>
                                </td>
                                <td className="px-6 py-3.5 font-black text-slate-500 text-center">{p.shelfNumber || 1}</td>
                                <td className="px-6 py-3.5 font-black text-slate-200 text-center">{p.facings}</td>
                                <td className="px-6 py-3.5 font-black text-slate-400 text-center">{p.depth}</td>
                                <td className="px-6 py-3.5 font-black text-cyan-400 text-center">{p.facings * p.depth}</td>
                                <td className="px-6 py-3.5">
                                    <div className="flex flex-col items-center">
                                        <span className="text-emerald-400 font-black">{p.currentStock}/{p.optimalStock}</span>
                                        <div className="w-12 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${Math.min(100, (p.currentStock / p.optimalStock) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-3.5">
                                    {p.sku === 'PRING-SV' || p.sku === 'LAV-CREMA' ? (
                                        <div className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-[9px] font-black uppercase tracking-widest text-center shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                            HIGH DEMAND
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Normal</div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
