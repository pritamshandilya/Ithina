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
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <h3 className="text-sm font-black tracking-widest text-white uppercase">
          Product Details
        </h3>
        <div className="text-[10px] font-bold tracking-tighter text-slate-500 uppercase">
          {products.length} total SKUs
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800/50 bg-slate-900/50 text-slate-400 capitalize">
              <th className="px-6 py-3 font-bold tracking-tighter">SKU</th>
              <th className="px-6 py-3 font-bold tracking-tighter">Product</th>
              <th className="px-6 py-3 font-bold tracking-tighter">Category</th>
              <th className="px-6 py-3 font-bold tracking-tighter">Shelf</th>
              <th className="px-6 py-3 font-bold tracking-tighter">Facings</th>
              <th className="px-6 py-3 text-center font-bold tracking-tighter">
                Depth
              </th>
              <th className="px-6 py-3 text-center font-bold tracking-tighter">
                Total Units
              </th>
              <th className="px-6 py-3 text-center font-bold tracking-tighter">
                Stock
              </th>
              <th className="px-6 py-3 font-bold tracking-tighter">Demand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {products.map((p, idx) => (
              <tr
                key={`${p.sku}-${idx}`}
                className="group transition-colors hover:bg-white/5"
              >
                <td className="px-6 py-3.5 font-mono text-[10px] text-slate-500 group-hover:text-slate-300">
                  {p.sku}
                </td>
                <td className="px-6 py-3.5">
                  <div className="font-bold text-slate-200">{p.name}</div>
                  <div className="text-[10px] font-medium text-slate-500">
                    {p.brand}
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-black tracking-tight uppercase",
                      p.category === "Aperitif Snacks"
                        ? "text-pink-400"
                        : p.category === "Chips"
                          ? "text-yellow-400"
                          : p.category === "Snacks"
                            ? "text-orange-400"
                            : p.category === "Kids Cereal"
                              ? "text-orange-300"
                              : p.category === "Coffee"
                                ? "text-orange-200"
                                : p.category === "Baby Care"
                                  ? "text-pink-300"
                                  : p.category === "Grooming"
                                    ? "text-cyan-400"
                                    : "text-slate-400",
                    )}
                  >
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-center font-black text-slate-500">
                  {p.shelfNumber || 1}
                </td>
                <td className="px-6 py-3.5 text-center font-black text-slate-200">
                  {p.facings}
                </td>
                <td className="px-6 py-3.5 text-center font-black text-slate-400">
                  {p.depth}
                </td>
                <td className="px-6 py-3.5 text-center font-black text-cyan-400">
                  {p.facings * p.depth}
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-col items-center">
                    <span className="font-black text-emerald-400">
                      {p.currentStock}/{p.optimalStock}
                    </span>
                    <div className="mt-1 h-1 w-12 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${Math.min(100, (p.currentStock / p.optimalStock) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  {p.sku === "PRING-SV" || p.sku === "LAV-CREMA" ? (
                    <div className="rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-center text-[9px] font-black tracking-widest text-yellow-500 uppercase shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                      HIGH DEMAND
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
                      Normal
                    </div>
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
