import { Pencil, Trash2, ChartLine } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function ShelfActions() {
  return (
    <div className="flex items-center justify-center gap-1">
      <IconButton
        icon={<Pencil size={16} />}
        tooltip="Edit"
        className="action-btn-edit text-blue-600 hover:bg-blue-500/10 hover:text-blue-700"
        aria-label="Edit shelf"
      />
      <IconButton
        icon={<Trash2 size={16} />}
        tooltip="Delete"
        className="action-btn-delete text-red-600 hover:bg-red-500/10 hover:text-red-700"
        aria-label="Delete shelf"
      />
      <IconButton
        icon={<ChartLine size={16} />}
        tooltip="Analyze"
        className="action-btn-analyze text-green-600 hover:bg-green-500/10 hover:text-green-700"
        aria-label="Analyze shelf"
      />
    </div>
  );
}

