import { cn } from "@/lib/utils";
import type { ReportShelfCompliance } from "@/lib/analysis";

const PLACEHOLDER_SHELF_PRODUCTS: Record<
  string,
  Array<{ name: string; status: "matched" | "misplaced" | "missing" | "extra"; count: string }>
> = {
  "Shelf 1": [
    { name: "Potato Chips 4/4", status: "matched", count: "D3" },
    { name: "Tortilla Chips 2/2", status: "misplaced", count: "D3" },
  ],
  "Shelf 2": [
    { name: "Coca-Cola 500ml 0/6", status: "missing", count: "D3" },
    { name: "Water Bottle 1L 0/3", status: "extra", count: "D3" },
    { name: "Energy Drink 0/6", status: "matched", count: "D3" },
  ],
  "Shelf 3": [
    { name: "Orange Juice 1L 0/4", status: "missing", count: "D3" },
    { name: "Sports Drink 2/2", status: "matched", count: "D3" },
    { name: "Iced Tea 500ml 0/6", status: "missing", count: "D3" },
  ],
  "Shelf 4": [
    { name: "Mineral Water 1L 0/3", status: "missing", count: "D3" },
    { name: "Soft Drink 2L 0/4", status: "missing", count: "D3" },
    { name: "Pretzels 2/2", status: "misplaced", count: "D3" },
  ],
};

export function OverviewShelfBreakdown({
  shelfCompliance,
}: {
  shelfCompliance: ReportShelfCompliance[];
}) {
  return (
    <div className="space-y-4">
      {shelfCompliance.map((shelf) => {
        const products = PLACEHOLDER_SHELF_PRODUCTS[shelf.shelfName] ?? [];
        const matchedCount = products.filter((p) => p.status === "matched").length;
        const misplacedCount = products.filter((p) => p.status === "misplaced").length;
        const missingCount = products.filter((p) => p.status === "missing").length;

        return (
          <div
            key={shelf.shelfName}
            className="border-b border-border pb-6 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-foreground">
                {shelf.shelfName} {shelf.shelfLabel ?? ""}
              </h4>
              <span className="text-xs text-muted-foreground">
                {shelf.units ?? 0} units · {shelf.skuCount ?? 0} SKUs
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-3 rounded bg-muted/60 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded transition-all",
                    shelf.compliance >= 80
                      ? "bg-chart-2"
                      : shelf.compliance > 0
                        ? "bg-action-warning"
                        : "bg-muted",
                  )}
                  style={{ width: `${shelf.compliance}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-xs font-medium w-10 text-right",
                  shelf.compliance >= 80 ? "text-chart-2" : "text-muted-foreground",
                )}
              >
                {shelf.compliance}%
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {products.map((p, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
                    p.status === "matched" &&
                      "bg-chart-2/20 text-chart-2 border border-chart-2/40",
                    p.status === "misplaced" &&
                      "bg-action-warning/20 text-action-warning border border-action-warning/40",
                    p.status === "missing" &&
                      "bg-destructive/20 text-destructive border border-destructive/40",
                    p.status === "extra" &&
                      "bg-blue-500/20 text-blue-500 border border-blue-500/40",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full shrink-0",
                      p.status === "matched" && "bg-chart-2",
                      p.status === "misplaced" && "bg-action-warning",
                      p.status === "missing" && "bg-destructive",
                      p.status === "extra" && "bg-blue-500",
                    )}
                  />
                  {p.name}
                  <span
                    className={cn(
                      "rounded px-1 text-[10px]",
                      p.status === "matched" && "bg-chart-2/30",
                      p.status === "misplaced" && "bg-action-warning/30",
                      p.status === "missing" && "bg-destructive/30",
                      p.status === "extra" && "bg-blue-500/30",
                    )}
                  >
                    {p.count}
                  </span>
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {matchedCount} matched {misplacedCount} misplaced {missingCount} missing
            </p>
          </div>
        );
      })}
    </div>
  );
}
