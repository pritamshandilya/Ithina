import { cn } from "@/lib/utils";

interface ProductVisualProps {
    category: string;
    isHighDemand?: boolean;
}

export function ProductVisual({ category, isHighDemand }: ProductVisualProps) {
    // Map category to colors and shapes
    const getStyle = () => {
        switch (category) {
            case "Chips":
                return { color: "bg-yellow-500", shape: "rounded-[2rem_2rem_1rem_1rem]" };
            case "Snacks":
            case "Kids Cereal":
            case "Coffee":
                return { color: "bg-orange-500", shape: "rounded-md" };
            case "Baby Care":
            case "First Aid":
                return { color: "bg-pink-500", shape: "rounded-t-full rounded-b-lg" };
            case "Grooming":
                return { color: "bg-cyan-500", shape: "rounded-t-lg rounded-b-sm" };
            case "Aperitif Snacks":
            default:
                return { color: "bg-pink-600", shape: "rounded-t-[3rem] rounded-b-xl" };
        }
    };

    const { color, shape } = getStyle();

    return (
        <div className={cn(
            "w-full h-full relative group/visual transition-all duration-300",
            isHighDemand && "drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
        )}>
            <div className={cn(
                "w-full h-full relative overflow-hidden shadow-2xl transition-all duration-300 group-hover/visual:brightness-110 border-t border-l border-white/20",
                color,
                shape,
                "bg-gradient-to-br from-white/20 via-transparent to-black/30"
            )}>
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[80%] bg-gradient-to-r from-white/30 to-transparent rounded-full blur-[2px] opacity-60" />

                {category === "Aperitif Snacks" && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-white/20 rounded-t-full" />
                )}

                {category === "Chips" && (
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-black/10 rounded-full border border-white/5" />
                )}

                {(category === "Kids Cereal" || category === "Coffee" || category === "First Aid") && (
                    <div className="absolute inset-2 border border-white/10 rounded-sm flex items-center justify-center">
                        <div className="w-1/2 h-1/2 bg-white/5 rounded-full blur-sm" />
                    </div>
                )}

                {category === "First Aid" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 text-xs font-bold font-serif">+</div>
                )}
            </div>

            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-black/40 blur-sm rounded-full" />
        </div>
    );
}
