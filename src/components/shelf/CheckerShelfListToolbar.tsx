import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CheckerShelfListToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onBulkAdd: () => void;
}

export function CheckerShelfListToolbar({
  searchQuery,
  onSearchChange,
  selectedCount,
  onDeleteSelected,
  onBulkAdd,
}: CheckerShelfListToolbarProps) {
  return (
    <div className="mt-4 flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-80">
        <Search
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          placeholder="Search shelves..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-background h-10 pl-9"
          aria-label="Search shelves"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={selectedCount === 0}
          className={
            selectedCount === 0
              ? "border-destructive text-destructive/60 cursor-not-allowed opacity-60"
              : "border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          }
          onClick={onDeleteSelected}
        >
          Delete selected
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkAdd}>
          Bulk add shelves
        </Button>
      </div>
    </div>
  );
}
