import {
  AlertTriangle,
  Image as ImageIcon,
  LayoutGrid,
  ListChecks,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  AllIssuesReportData,
  AllItemsReportData,
  ImageComparisonData,
  ReportSnippet,
} from "@/lib/analysis";
import { cn } from "@/lib/utils";

const BAR_WIDTH_CLASS = [
  "w-0",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-[50%]",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-full",
];

function toWidthClass(value: number) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const bucket = Math.round(clamped / 10);
  return BAR_WIDTH_CLASS[bucket];
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  return (
    <article
      className={cn(
        "border-border bg-card/60 rounded-lg border px-3 py-2",
        tone === "good" && "border-chart-2/50 bg-chart-2/10",
        tone === "warn" && "border-action-warning/50 bg-action-warning/10",
        tone === "bad" && "border-destructive/50 bg-destructive/10",
      )}
    >
      <p className="text-muted-foreground text-[11px] uppercase">{label}</p>
      <p className="text-foreground text-lg leading-tight font-semibold">
        {value}
      </p>
    </article>
  );
}

export function ReportStatsStrip({ report }: { report: ReportSnippet }) {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
      <StatCard
        label="Compliance"
        value={`${report.complianceScore}%`}
        tone="bad"
      />
      <StatCard label="Detected" value={report.detected} />
      <StatCard label="Matched" value={report.matched} tone="good" />
      <StatCard label="Missing" value={report.missing} tone="bad" />
      <StatCard label="Misplaced" value={report.misplaced} tone="warn" />
      <StatCard label="Unexpected" value={report.extra} tone="warn" />
      <StatCard label="Issues" value={report.issues} tone="bad" />
      <StatCard label="Gap" value={report.gap} />
    </section>
  );
}

export function ReportOverview({
  report,
  isPlanogram,
}: {
  report: ReportSnippet;
  isPlanogram: boolean;
}) {
  const maxIssue = Math.max(
    1,
    ...report.issueCategories.map((entry) => entry.count),
  );

  return (
    <div className="grid gap-3 xl:grid-cols-3">
      <section className="border-border bg-card/60 rounded-xl border p-4 xl:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="text-accent size-4" />
          <h3 className="text-sm font-semibold">Executive Snapshot</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          {report.executiveSummary}
        </p>
        <div className="mt-3 space-y-2">
          {report.keyFindings.map((finding, index) => (
            <div
              key={`${finding.text}-${index}`}
              className={cn(
                "rounded-md border px-3 py-2 text-sm",
                finding.type === "error" &&
                  "border-destructive/40 bg-destructive/10",
                finding.type === "warning" &&
                  "border-action-warning/40 bg-action-warning/10",
                finding.type === "info" && "border-accent/40 bg-accent/10",
              )}
            >
              {finding.text}
            </div>
          ))}
        </div>
      </section>

      <section className="border-border bg-card/60 rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="text-accent size-4" />
          <h3 className="text-sm font-semibold">Recommended Actions</h3>
        </div>
        <ul className="space-y-2">
          {report.aiRecommendations.slice(0, 5).map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="text-muted-foreground text-sm"
            >
              - {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-border bg-card/60 rounded-xl border p-4">
        <div className="mb-3 flex items-center gap-2">
          <LayoutGrid className="text-accent size-4" />
          <h3 className="text-sm font-semibold">Compliance by Shelf</h3>
        </div>
        <div className="space-y-2">
          {report.shelfCompliance.map((row) => (
            <div key={row.shelfName}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.shelfName}</span>
                <span className="text-foreground font-medium">
                  {row.compliance}%
                </span>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    toWidthClass(row.compliance),
                    row.compliance >= 80
                      ? "bg-chart-2"
                      : row.compliance > 30
                        ? "bg-action-warning"
                        : "bg-destructive",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-border bg-card/60 rounded-xl border p-4 xl:col-span-2">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="text-accent size-4" />
          <h3 className="text-sm font-semibold">
            {isPlanogram ? "Issue Distribution" : "Detected Issue Mix"}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <StatCard
            label="Matched"
            value={report.issueDistribution.matched}
            tone="good"
          />
          <StatCard
            label="Misplaced"
            value={report.issueDistribution.misplaced}
            tone="warn"
          />
          <StatCard
            label="Missing"
            value={report.issueDistribution.missing}
            tone="bad"
          />
          <StatCard
            label="Unexpected"
            value={report.issueDistribution.extra}
            tone="warn"
          />
        </div>
        <div className="mt-3 space-y-2">
          {report.issueCategories.map((category) => (
            <div key={category.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{category.title}</span>
                <span className="text-foreground">{category.count}</span>
              </div>
              <div className="bg-muted h-2 rounded-full">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    toWidthClass((category.count / maxIssue) * 100),
                    category.variant === "missing" && "bg-destructive",
                    category.variant === "misplaced" && "bg-action-warning",
                    category.variant === "extra" && "bg-accent",
                    category.variant === "analysis" && "bg-chart-3",
                    !category.variant && "bg-chart-2",
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ReportImagePanel({
  imageUrl,
  imageComparison,
}: {
  imageUrl?: string | null;
  imageComparison?: ImageComparisonData | null;
}) {
  const [showOverlay, setShowOverlay] = useState(true);
  const overlays = useMemo(() => {
    if (!showOverlay) return [];
    return imageComparison?.detectionOverlays ?? [];
  }, [imageComparison?.detectionOverlays, showOverlay]);

  return (
    <section className="border-border bg-card/60 rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="text-accent size-4" />
          <h3 className="text-sm font-semibold">Shelf Image Review</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowOverlay((prev) => !prev)}
          className="border-border bg-secondary text-secondary-foreground rounded-md border px-2 py-1 text-xs"
        >
          {showOverlay ? "Hide overlays" : "Show overlays"}
        </button>
      </div>

      {imageUrl ? (
        <div className="border-border bg-background relative overflow-hidden rounded-lg border">
          <img
            src={imageUrl}
            alt="Analyzed shelf"
            className="max-h-[520px] w-full object-contain"
          />
        </div>
      ) : (
        <div className="border-border bg-background text-muted-foreground rounded-lg border px-4 py-8 text-center text-sm">
          No annotated image available for this report.
        </div>
      )}
      {showOverlay && overlays.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <StatCard
            label="Compliant markers"
            value={
              overlays.filter((overlay) => overlay.status === "compliant")
                .length
            }
            tone="good"
          />
          <StatCard
            label="Misplaced markers"
            value={
              overlays.filter((overlay) => overlay.status === "misplaced")
                .length
            }
            tone="warn"
          />
          <StatCard
            label="Missing markers"
            value={
              overlays.filter((overlay) => overlay.status === "missing").length
            }
            tone="bad"
          />
          <StatCard
            label="Extra markers"
            value={
              overlays.filter((overlay) => overlay.status === "extra").length
            }
            tone="warn"
          />
        </div>
      ) : null}
    </section>
  );
}

export function ReportIssuesPanel({
  data,
}: {
  data?: AllIssuesReportData | null;
}) {
  const issues = useMemo(() => {
    const flattened = (data?.categories ?? []).flatMap((category) =>
      category.issues.map((entry) => ({
        ...entry,
        group: category.title,
      })),
    );
    const unique = new Map<string, (typeof flattened)[number]>();
    flattened.forEach((issue) => {
      const key =
        `${issue.group}-${issue.productName}-${issue.description}`.toLowerCase();
      if (!unique.has(key)) {
        unique.set(key, issue);
      }
    });
    return Array.from(unique.values());
  }, [data?.categories]);

  return (
    <section className="border-border bg-card/60 rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="text-accent size-4" />
        <h3 className="text-sm font-semibold">Issues to Address</h3>
      </div>
      <div className="max-h-[420px] overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-2 text-left font-medium">Category</th>
              <th className="p-2 text-left font-medium">Product</th>
              <th className="p-2 text-left font-medium">Description</th>
              <th className="p-2 text-left font-medium">Shelf</th>
              <th className="p-2 text-left font-medium">Severity</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.id} className="border-t">
                <td className="text-muted-foreground p-2">{issue.group}</td>
                <td className="p-2">{issue.productName}</td>
                <td className="text-muted-foreground p-2">
                  {issue.description}
                </td>
                <td className="text-muted-foreground p-2">
                  {issue.detail ?? "-"}
                </td>
                <td className="p-2">{issue.severity}</td>
              </tr>
            ))}
            {issues.length === 0 && (
              <tr>
                <td
                  className="text-muted-foreground p-4 text-center"
                  colSpan={5}
                >
                  No issues detected.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ReportItemsPanel({
  data,
}: {
  data?: AllItemsReportData | null;
}) {
  const items = useMemo(() => {
    const rows = data?.skuFacings ?? [];
    return rows.slice().sort((a, b) => {
      const severityRank = { short: 0, extra: 1, ok: 2 } as const;
      const rankDiff =
        severityRank[a.facingDiffVariant] - severityRank[b.facingDiffVariant];
      if (rankDiff !== 0) return rankDiff;
      return a.productName.localeCompare(b.productName);
    });
  }, [data?.skuFacings]);

  return (
    <section className="border-border bg-card/60 rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <ScanLine className="text-accent size-4" />
        <h3 className="text-sm font-semibold">Detected Items Summary</h3>
      </div>
      <div className="max-h-[420px] overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="p-2 text-left font-medium">Product</th>
              <th className="p-2 text-left font-medium">Facings</th>
              <th className="p-2 text-left font-medium">Detected</th>
              <th className="p-2 text-left font-medium">Diff</th>
              <th className="p-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">{item.productName}</td>
                <td className="text-muted-foreground p-2">
                  {item.frontFacings}
                </td>
                <td className="text-muted-foreground p-2">{item.detected}</td>
                <td className="text-muted-foreground p-2">
                  {item.facingDiffText}
                </td>
                <td className="p-2">{item.facingDiffVariant.toUpperCase()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  className="text-muted-foreground p-4 text-center"
                  colSpan={5}
                >
                  No items available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
