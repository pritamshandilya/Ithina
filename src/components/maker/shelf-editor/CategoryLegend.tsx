import { cn } from "@/lib/utils";

interface CategoryLegendProps {
    categories: Record<string, string>;
}

export function CategoryLegend({ categories }: CategoryLegendProps) {
    return (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 px-2">
            {Object.entries(categories).map(([name, color]) => (
                <div key={name} className="flex items-center gap-2">
                    <div className={cn("size-2.5 rounded-full shadow-sm", color)} />
                    <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{name}</span>
                </div>
            ))}
            <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-yellow-400 ring-4 ring-yellow-400/20 shadow-sm" />
                <span className="text-[10px] font-bold text-yellow-500 tracking-wide uppercase">High Demand</span>
            </div>
        </div>
    );
}
