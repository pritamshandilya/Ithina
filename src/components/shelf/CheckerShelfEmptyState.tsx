import { LayoutGrid } from "lucide-react";

export function CheckerShelfEmptyState() {
  return (
    <div className="border-border bg-card/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
      <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <LayoutGrid className="text-muted-foreground h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-foreground text-lg font-semibold">No shelves yet</h3>
    </div>
  );
}
