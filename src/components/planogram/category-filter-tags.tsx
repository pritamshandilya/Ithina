/**
 * CategoryFilterTags – colored pills for each category in the planogram
 * Wireframe: display only; filtering can be Phase 2
 */

import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/constants/planogram";

export interface CategoryFilterTagsProps {
  categories: string[];
  /** Selected categories (for future filter support) */
  selected?: Set<string>;
  onToggle?: (category: string) => void;
  className?: string;
}

export function CategoryFilterTags({
  categories,
  selected,
  onToggle,
  className,
}: CategoryFilterTagsProps) {
  const sorted = [...categories].sort();

  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Category filter tags"
    >
      {sorted.map((category) => {
        const isSelected = selected?.has(category) ?? true;
        const colorClass = getCategoryColor(category);

        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle?.(category)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-opacity",
              colorClass,
              "border border-border",
              isSelected ? "opacity-100" : "opacity-50 hover:opacity-75",
              !onToggle && "cursor-default"
            )}
            aria-pressed={onToggle ? isSelected : undefined}
            disabled={!onToggle}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
