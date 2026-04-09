import { LayoutGrid } from "lucide-react";

export function CheckerShelfEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <LayoutGrid className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No shelves yet</h3>
    </div>
  );
}
