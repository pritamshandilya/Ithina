import { cn } from "@/lib/utils";
import type { ReportSnippet, ReportShelfCompliance } from "@/lib/analysis";

type ShelfItemStatus = "matched" | "misplaced" | "missing" | "extra";

interface ShelfBreakdownItem {
  name: string;
  status: ShelfItemStatus;
  count: string;
}

function normalizeLocation(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapIssueTypeToStatus(type: string): ShelfItemStatus {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("missing")) return "missing";
  if (normalizedType.includes("misplaced")) return "misplaced";
  if (normalizedType.includes("unexpected") || normalizedType.includes("extra")) {
    return "extra";
  }
  return "matched";
}

function buildShelfBreakdownMap(
  shelfCompliance: ReportShelfCompliance[],
  issuesToReview: ReportSnippet["issuesToReview"],
): Map<string, ShelfBreakdownItem[]> {
  const issuesByShelf = new Map<string, ShelfBreakdownItem[]>();
  const normalizedShelfNames = shelfCompliance.map((shelf) => ({
    key: shelf.shelfName,
    normalized: normalizeLocation(shelf.shelfName),
  }));

  for (const issue of issuesToReview) {
    const location = issue.location ? normalizeLocation(issue.location) : "";
    const matchedShelf =
      normalizedShelfNames.find(
        (shelf) => location.includes(shelf.normalized) || shelf.normalized.includes(location),
      )?.key ?? null;
    if (!matchedShelf) continue;

    const shelfIssues = issuesByShelf.get(matchedShelf) ?? [];
    shelfIssues.push({
      name: issue.skuName?.trim() || "Issue detected",
      status: mapIssueTypeToStatus(issue.type),
      count: issue.type.toUpperCase(),
    });
    issuesByShelf.set(matchedShelf, shelfIssues);
  }

  return issuesByShelf;
}

export function OverviewShelfBreakdown({
  shelfCompliance,
  issuesToReview,
}: {
  shelfCompliance: ReportShelfCompliance[];
  issuesToReview: ReportSnippet["issuesToReview"];
}) {
  const shelfBreakdownMap = buildShelfBreakdownMap(shelfCompliance, issuesToReview);

  return (
    <div className="space-y-4">
      {shelfCompliance.map((shelf) => {
        const products = shelfBreakdownMap.get(shelf.shelfName) ?? [];
        const explicitMatchedCount = products.filter((p) => p.status === "matched").length;
        const misplacedCount = products.filter((p) => p.status === "misplaced").length;
        const missingCount = products.filter((p) => p.status === "missing").length;
        const extraCount = products.filter((p) => p.status === "extra").length;
        const inferredMatchedCount = Math.max(
          0,
          (shelf.skuCount ?? shelf.units ?? 0) - misplacedCount - missingCount - extraCount,
        );
        const matchedCount = Math.max(explicitMatchedCount, inferredMatchedCount);

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
            {products.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {products.map((p, i) => (
                  <span
                    key={`${p.name}-${i}`}
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
            ) : (
              <p className="text-xs text-muted-foreground mb-2">
                No shelf-level issues detected.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {matchedCount} matched {misplacedCount} misplaced {missingCount} missing
            </p>
          </div>
        );
      })}
    </div>
  );
}
