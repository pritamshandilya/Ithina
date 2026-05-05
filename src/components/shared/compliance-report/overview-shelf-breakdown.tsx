import { useState } from "react";
import type {
  AllItemsReportData,
  ReportShelfCompliance,
  ReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";

type ShelfItemStatus = "matched" | "misplaced" | "missing" | "extra";

interface ShelfIssueItem {
  name: string;
  status: ShelfItemStatus;
}

function normalizeLocation(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapIssueTypeToStatus(type: string): ShelfItemStatus {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes("missing")) return "missing";
  if (normalizedType.includes("misplaced")) return "misplaced";
  if (
    normalizedType.includes("unexpected") ||
    normalizedType.includes("extra")
  ) {
    return "extra";
  }
  return "matched";
}

function buildShelfIssueMap(
  shelfCompliance: ReportShelfCompliance[],
  issuesToReview: ReportSnippet["issuesToReview"],
): Map<string, ShelfIssueItem[]> {
  const issuesByShelf = new Map<string, ShelfIssueItem[]>();
  const normalizedShelfNames = shelfCompliance.map((shelf) => ({
    key: shelf.shelfName,
    normalized: normalizeLocation(shelf.shelfName),
  }));

  for (const issue of issuesToReview) {
    const location = issue.location ? normalizeLocation(issue.location) : "";
    const matchedShelf =
      normalizedShelfNames.find(
        (shelf) =>
          location.includes(shelf.normalized) ||
          shelf.normalized.includes(location),
      )?.key ?? null;
    if (!matchedShelf) continue;

    const shelfIssues = issuesByShelf.get(matchedShelf) ?? [];
    shelfIssues.push({
      name: issue.skuName?.trim() || "Issue detected",
      status: mapIssueTypeToStatus(issue.type),
    });
    issuesByShelf.set(matchedShelf, shelfIssues);
  }

  return issuesByShelf;
}

function parseShelfNumber(shelfName: string): number | null {
  const match = shelfName.match(/(\d+)/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function parseShelfNumberFromSku(sku: string): number | null {
  const match = sku.match(/-(\d+)$/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

function buildShelfItemsMap(allItems?: AllItemsReportData | null) {
  const map = new Map<number, AllItemsReportData["skuFacings"]>();
  for (const row of allItems?.skuFacings ?? []) {
    const shelfNumber = parseShelfNumberFromSku(row.sku);
    if (shelfNumber === null) continue;
    const rows = map.get(shelfNumber) ?? [];
    rows.push(row);
    map.set(shelfNumber, rows);
  }
  return map;
}

export function OverviewShelfBreakdown({
  shelfCompliance,
  issuesToReview,
  allItems = null,
}: {
  shelfCompliance: ReportShelfCompliance[];
  issuesToReview: ReportSnippet["issuesToReview"];
  allItems?: AllItemsReportData | null;
}) {
  const shelfIssueMap = buildShelfIssueMap(
    shelfCompliance,
    issuesToReview,
  );
  const shelfItemsMap = buildShelfItemsMap(allItems);
  const [expandedShelves, setExpandedShelves] = useState<Record<string, boolean>>(
    {},
  );

  return (
    <div className="space-y-2">
      {shelfCompliance.map((shelf) => {
        const shelfNumber = parseShelfNumber(shelf.shelfName);
        const shelfItems =
          shelfNumber !== null ? (shelfItemsMap.get(shelfNumber) ?? []) : [];
        const shelfIssues = shelfIssueMap.get(shelf.shelfName) ?? [];
        const issueByName = new Map(
          shelfIssues.map((entry) => [entry.name.toLowerCase(), entry.status] as const),
        );
        const misplacedCount = shelfItems.filter(
          (item) => issueByName.get(item.productName.toLowerCase()) === "misplaced",
        ).length;
        const missingCount = shelfIssues.filter((item) => item.status === "missing").length;
        const extraCount = shelfIssues.filter((item) => item.status === "extra").length;
        const nonCompliantItems = shelfItems.filter((item) => {
          const status = issueByName.get(item.productName.toLowerCase()) ?? "matched";
          return status !== "matched";
        });
        const maxVisible = 3;
        const visibleItems = nonCompliantItems.slice(0, maxVisible);
        const isExpanded = expandedShelves[shelf.shelfName] ?? false;
        const toggleExpanded = () =>
          setExpandedShelves((prev) => ({
            ...prev,
            [shelf.shelfName]: !isExpanded,
          }));

        return (
          <div
            key={shelf.shelfName}
            className="border-border bg-background/30 rounded-lg border px-2.5 py-2"
          >
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5">
              <h4 className="text-foreground text-[11px] font-semibold">
                {shelf.shelfName} {shelf.shelfLabel ?? ""}
              </h4>
              <span className="text-muted-foreground text-[10px]">
                {shelf.units ?? 0} units · {shelf.skuCount ?? 0} SKUs
              </span>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  shelf.compliance >= 80
                    ? "text-chart-2"
                    : shelf.compliance > 0
                      ? "text-action-warning"
                      : "text-destructive",
                )}
              >
                {shelf.compliance}%
              </span>
            </div>
            <div className="mb-1.5 flex items-center gap-2">
              <div className="bg-muted/60 h-2 flex-1 overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    shelf.compliance >= 80
                      ? "bg-linear-to-r from-chart-2/85 to-chart-2"
                      : shelf.compliance > 0
                        ? "bg-linear-to-r from-action-warning/85 to-action-warning"
                        : "bg-destructive/70",
                  )}
                  style={{ width: `${shelf.compliance}%` }}
                />
              </div>
            </div>
            {nonCompliantItems.length > 0 ? (
              <div className="mb-0.5 flex flex-wrap gap-1">
                {visibleItems.map((item) => {
                  const status = issueByName.get(item.productName.toLowerCase()) ?? "matched";
                  return (
                  <span
                    key={item.id}
                    className={cn(
                      "border-border bg-card/70 text-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                    )}
                  >
                    <span className="max-w-[110px] truncate">{item.productName}</span>
                    <span
                      className={cn(
                        "rounded px-1 text-[9px]",
                        status === "matched" && "bg-chart-2/20 text-chart-2",
                        status === "misplaced" &&
                          "bg-action-warning/20 text-action-warning",
                        status === "missing" && "bg-destructive/20 text-destructive",
                        status === "extra" && "bg-blue-500/20 text-blue-500",
                      )}
                    >
                      {item.detected}/{item.frontFacings} D{item.depth}
                    </span>
                  </span>
                );
                })}
                {nonCompliantItems.length > maxVisible && (
                  <button
                    type="button"
                    onClick={toggleExpanded}
                    className="text-accent inline-flex items-center text-[10px] font-medium underline-offset-2 hover:underline"
                  >
                    +{nonCompliantItems.length - maxVisible} more
                  </button>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground mb-0.5 text-[10px]">
                No non-compliant products on this shelf.
              </p>
            )}
            <p className="text-muted-foreground text-[10px]">
              {misplacedCount} misplaced · {missingCount} missing · {extraCount} extra
            </p>
            {shelfItems.length > 0 && (
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={toggleExpanded}
                  className="text-muted-foreground hover:text-foreground text-[10px] underline-offset-2 hover:underline"
                >
                  {isExpanded
                    ? "Hide details"
                    : `View details (${shelfItems.length} products)`}
                </button>
              </div>
            )}
            {isExpanded && shelfItems.length > 0 && (
              <div className="border-border mt-1.5 rounded-md border p-1.5">
                <div className="flex flex-wrap gap-1">
                  {shelfItems.map((item) => {
                    const status =
                      issueByName.get(item.productName.toLowerCase()) ?? "matched";
                    return (
                      <span
                        key={`detail-${item.id}`}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
                          status === "matched" &&
                            "border-chart-2/40 bg-chart-2/20 text-chart-2",
                          status === "misplaced" &&
                            "border-action-warning/40 bg-action-warning/20 text-action-warning",
                          status === "missing" &&
                            "border-destructive/40 bg-destructive/20 text-destructive",
                          status === "extra" &&
                            "border-blue-500/40 bg-blue-500/20 text-blue-500",
                        )}
                      >
                        <span className="max-w-[120px] truncate">{item.productName}</span>
                        <span className="rounded bg-black/10 px-1 text-[9px]">
                          {item.detected}/{item.frontFacings} D{item.depth}
                        </span>
                        <span className="uppercase">{status}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
