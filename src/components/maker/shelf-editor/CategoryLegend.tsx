import { cn } from "@/lib/utils";

interface CategoryLegendProps {
    categories: Record<string, string>;
    hiddenCategories?: Set<string>;
    onToggleCategory?: (category: string) => void;
}

export function CategoryLegend({ categories, hiddenCategories, onToggleCategory }: CategoryLegendProps) {
    return (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 px-2">
            {Object.entries(categories).map(([name, color]) => {
                const isHidden = hiddenCategories?.has(name);
                const isClickable = !!onToggleCategory;
                
                return (
                    <button
                        key={name}
                        type="button"
                        onClick={() => onToggleCategory?.(name)}
                        disabled={!isClickable}
                        className={cn(
                            "flex items-center gap-2 transition-opacity",
                            isClickable && "cursor-pointer hover:opacity-80",
                            !isClickable && "cursor-default",
                            isHidden && "opacity-50"
                        )}
                    >
                        <div className={cn("size-2.5 rounded-full shadow-sm", color)} />
                        <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{name}</span>
                    </button>
                );
            })}
            <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-yellow-400 ring-4 ring-yellow-400/20 shadow-sm" />
                <span className="text-[10px] font-bold text-yellow-500 tracking-wide uppercase">High Demand</span>
            </div>
        </div>
    );
}
