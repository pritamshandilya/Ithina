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
        return {
          color: "bg-yellow-500",
          shape: "rounded-[2rem_2rem_1rem_1rem]",
        };
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
    <div
      className={cn(
        "group/visual relative h-full w-full transition-all duration-300",
        isHighDemand && "drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]",
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border-t border-l border-white/20 shadow-2xl transition-all duration-300 group-hover/visual:brightness-110",
          color,
          shape,
          "bg-gradient-to-br from-white/20 via-transparent to-black/30",
        )}
      >
        <div className="absolute top-[10%] left-[10%] h-[80%] w-[30%] rounded-full bg-gradient-to-r from-white/30 to-transparent opacity-60 blur-[2px]" />

        {category === "Aperitif Snacks" && (
          <div className="absolute top-0 left-1/2 h-4 w-1/2 -translate-x-1/2 rounded-t-full bg-white/20" />
        )}

        {category === "Chips" && (
          <div className="absolute top-[20%] left-1/2 h-[40%] w-[60%] -translate-x-1/2 rounded-full border border-white/5 bg-black/10" />
        )}

        {(category === "Kids Cereal" ||
          category === "Coffee" ||
          category === "First Aid") && (
          <div className="absolute inset-2 flex items-center justify-center rounded-sm border border-white/10">
            <div className="h-1/2 w-1/2 rounded-full bg-white/5 blur-sm" />
          </div>
        )}

        {category === "First Aid" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif text-xs font-bold text-white/50">
            +
          </div>
        )}
      </div>

      <div className="absolute -bottom-1 left-1/2 h-1 w-[80%] -translate-x-1/2 rounded-full bg-black/40 blur-sm" />
    </div>
  );
}
