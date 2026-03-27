import { Pencil, Trash2, ChartLine } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function ShelfActions() {
  return (
    <div className="flex items-center justify-center gap-1" title="Shelf actions">
      <IconButton
        icon={<Pencil size={16} />}
        variant="icon-ghost"
        tooltip="Edit"
        title="Edit shelf"
        aria-label="Edit shelf"
      />
      <IconButton
        icon={<Trash2 size={16} />}
        variant="destructive-ghost"
        tooltip="Delete"
        title="Delete shelf"
        aria-label="Delete shelf"
      />
      <IconButton
        icon={<ChartLine size={16} />}
        variant="success-ghost"
        tooltip="Analyze"
        title="Analyze shelf"
        aria-label="Analyze shelf"
      />
    </div>
  );
}
