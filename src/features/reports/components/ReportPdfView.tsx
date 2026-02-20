/**
 * ReportPdfView – PDF-safe report component
 *
 * Replicates Combined Compliance & Analysis Report layout for PDF export.
 * Uses ONLY hex, rgb, rgba – no oklab, oklch, color-mix, or design system tokens.
 * This component is rendered in a hidden container and passed to html2canvas.
 */

import type { ReportPdfData } from "../types";
import {
  MOCK_ALL_ITEMS_REPORT,
  MOCK_ALL_ISSUES_REPORT,
  MOCK_IMAGE_COMPARISON,
} from "@/features/maker/analysis";

const COLORS = {
  text: "#1a1a1a",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  bgCard: "#f9fafb",
  bgMuted: "#f3f4f6",
  success: "#10b982",
  warning: "#f59e0b",
  destructive: "#ef4444",
  blue: "#3b82f6",
  teal: "#14b8a6",
  purple: "#a78bfa",
} as const;

const sectionStyle: React.CSSProperties = {
  marginBottom: 32,
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 600,
  color: COLORS.text,
  marginBottom: 16,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  backgroundColor: COLORS.bgCard,
  padding: 16,
  marginBottom: 16,
};

export interface ReportPdfViewProps {
  data: ReportPdfData;
}

export function ReportPdfView({ data }: ReportPdfViewProps) {
  const { report, imageUrl, allItems, allIssues, imageComparison } = data;
  const items = allItems ?? MOCK_ALL_ITEMS_REPORT;
  const issues = allIssues ?? MOCK_ALL_ISSUES_REPORT;
  const imgData = imageComparison ?? MOCK_IMAGE_COMPARISON;

  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  const totalDist =
    report.issueDistribution.matched +
    report.issueDistribution.misplaced +
    report.issueDistribution.missing +
    report.issueDistribution.extra;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: COLORS.text,
        padding: 24,
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 14,
      }}
    >
      {/* Header */}
      <header style={sectionStyle}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: COLORS.text, margin: 0 }}>
          Combined Compliance & Analysis Report
        </h1>
        <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4, margin: 0 }}>{subtitle}</p>
      </header>

      {/* Metrics */}
      <section style={sectionStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <MetricCard label="Compliance" value={`${report.complianceScore}%`} variant="score" />
          <MetricCard label="Matched" value={report.matched} color={COLORS.success} />
          <MetricCard label="Misplaced" value={report.misplaced} color={COLORS.warning} />
          <MetricCard label="Missing" value={report.missing} color={COLORS.destructive} />
          <MetricCard label="Extra" value={report.extra} color={COLORS.blue} />
          <MetricCard label="Issues" value={report.issues} color={COLORS.warning} />
          <MetricCard label="Facings" value={report.facings} />
          <MetricCard label="Units" value={report.units} />
          <MetricCard label="Detected" value={report.detected} />
          <MetricCard label="Gap" value={report.gap} color={COLORS.destructive} />
        </div>
      </section>

      {/* Overview & Charts */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Overview & Charts</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 8 }}>
              Executive Summary
            </h3>
            <p style={{ fontSize: 14, color: COLORS.text, margin: 0 }}>{report.executiveSummary}</p>
            <div style={{ marginTop: 12 }}>
              {report.keyFindings.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    marginBottom: 8,
                    borderRadius: 8,
                    fontSize: 14,
                    backgroundColor:
                      f.type === "error"
                        ? "rgba(239, 68, 68, 0.1)"
                        : f.type === "warning"
                          ? "rgba(245, 158, 11, 0.1)"
                          : "rgba(167, 139, 250, 0.1)",
                    border: `1px solid ${
                      f.type === "error"
                        ? "rgba(239, 68, 68, 0.3)"
                        : f.type === "warning"
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(167, 139, 250, 0.3)"
                    }`,
                  }}
                >
                  {f.text}
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 8 }}>
              AI Recommendations
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {report.aiRecommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: 8, color: COLORS.text }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, marginTop: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 12 }}>
              Compliance by Shelf
            </h3>
            {report.shelfCompliance.map((s) => (
              <div
                key={s.shelfName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span style={{ width: 80, fontSize: 12, color: COLORS.text, textAlign: "right" }}>
                  {s.shelfName}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 20,
                    backgroundColor: COLORS.bgMuted,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${s.compliance}%`,
                      height: "100%",
                      backgroundColor:
                        s.compliance >= 80 ? COLORS.success : s.compliance > 0 ? COLORS.warning : COLORS.destructive,
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.text, width: 32, textAlign: "right" }}>
                  {s.compliance}%
                </span>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 12 }}>
              Planogram Issue Distribution
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <DonutChart distribution={report.issueDistribution} total={totalDist} />
              <div style={{ fontSize: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLORS.success }} />
                  Matched: {report.issueDistribution.matched}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLORS.warning }} />
                  Misplaced: {report.issueDistribution.misplaced}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLORS.destructive }} />
                  Missing: {report.issueDistribution.missing}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLORS.blue }} />
                  Extra: {report.issueDistribution.extra}
                </div>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 12 }}>
              All Issues Breakdown
            </h3>
            {report.issueCategories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={{ width: 96, fontSize: 12, color: COLORS.text }}>{cat.title}</span>
                <div
                  style={{
                    flex: 1,
                    height: 16,
                    backgroundColor: COLORS.bgMuted,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (cat.count / Math.max(...report.issueCategories.map((c) => c.count))) * 100)}%`,
                      height: "100%",
                      backgroundColor: variantColor(cat.variant),
                    }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: COLORS.text, width: 24, textAlign: "right" }}>
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Comparison */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Image Comparison</h2>
        <p style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 16 }}>
          Side-by-side comparison: Planogram (expected layout) vs Real Shelf (captured image).
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
              Planogram (Expected)
            </h3>
            {imgData.planogramShelves.map((shelf) => (
              <div key={shelf.shelfName} style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
                  {shelf.shelfName}: {shelf.shelfLabel ?? ""} — {shelf.units} UNITS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {shelf.slots.map((slot) => (
                    <span
                      key={slot.id}
                      style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        borderRadius: 4,
                        backgroundColor: statusBg(slot.status),
                        border: `1px solid ${statusBorder(slot.status)}`,
                        color: COLORS.text,
                      }}
                    >
                      {slot.shortName} {slot.detectedFacings}/{slot.expectedFacings} D{slot.depth}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
              Real Shelf (Captured)
            </h3>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Captured shelf"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
              />
            ) : (
              <div
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: COLORS.textMuted,
                  backgroundColor: COLORS.bgMuted,
                  borderRadius: 8,
                }}
              >
                No shelf image available
              </div>
            )}
          </div>
        </div>
      </section>

      {/* All Issues */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>All Issues</h2>
        {issues.categories.map((category) => (
          <div
            key={category.id}
            style={{
              ...cardStyle,
              backgroundColor: variantBg(category.variant),
              borderColor: variantBorder(category.variant),
            }}
          >
            <p style={{ fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>
              {category.title} {category.issues.length}
            </p>
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>{category.description}</p>
            {category.issues.map((issue) => (
              <div
                key={issue.id}
                style={{
                  padding: 12,
                  backgroundColor: "#ffffff",
                  borderBottom: `1px solid ${COLORS.border}`,
                  marginBottom: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <p style={{ fontWeight: 500, color: COLORS.text, margin: 0 }}>{issue.productName}</p>
                    <p style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4, margin: 0 }}>
                      {issue.description}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 8px",
                      borderRadius: 4,
                      backgroundColor: severityBg(issue.severity),
                      color: severityColor(issue.severity),
                      border: `1px solid ${severityBorder(issue.severity)}`,
                    }}
                  >
                    {issue.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {/* All Items */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>All Items</h2>

        <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
          SKU Facings & Depth Summary
        </h3>
        <SimpleTable
          columns={[
            { key: "productName", header: "SKU / Product" },
            { key: "frontFacings", header: "Front Facings" },
            { key: "detected", header: "Detected" },
            { key: "depth", header: "Depth" },
            { key: "totalExpected", header: "Total Expected" },
            { key: "facingDiffText", header: "Facing Diff" },
            { key: "facingDiffVariant", header: "Status" },
          ]}
          data={items.skuFacings}
          renderCell={(row, key) => {
            if (key === "productName") return `${row.productName} (${row.sku})`;
            if (key === "facingDiffVariant")
              return (
                <span
                  style={{
                    padding: "2px 8px",
                    fontSize: 11,
                    borderRadius: 4,
                    backgroundColor:
                      row.facingDiffVariant === "ok"
                        ? "rgba(16, 185, 130, 0.2)"
                        : row.facingDiffVariant === "extra"
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(239, 68, 68, 0.2)",
                    color:
                      row.facingDiffVariant === "ok"
                        ? COLORS.success
                        : row.facingDiffVariant === "extra"
                          ? COLORS.blue
                          : COLORS.destructive,
                  }}
                >
                  {row.facingDiffVariant === "ok" ? "OK" : row.facingDiffVariant === "extra" ? "Extra" : "Short"}
                </span>
              );
            if (key === "facingDiffText")
              return (
                <span
                  style={{
                    color:
                      row.facingDiffVariant === "short"
                        ? COLORS.destructive
                        : row.facingDiffVariant === "extra"
                          ? COLORS.blue
                          : COLORS.success,
                    fontWeight: 500,
                  }}
                >
                  {row.facingDiffText}
                </span>
              );
            return String((row as Record<string, unknown>)[key] ?? "—");
          }}
        />

        <h3 style={{ fontSize: 12, fontWeight: 600, color: COLORS.text, marginTop: 24, marginBottom: 12 }}>
          All Planogram Items ({items.planogramItems.length})
        </h3>
        <SimpleTable
          columns={[
            { key: "productName", header: "Product / SKU" },
            { key: "issueDescription", header: "Issue" },
            { key: "shelf", header: "Shelf" },
            { key: "complianceLevel", header: "Issue Severity" },
          ]}
          data={items.planogramItems}
          renderCell={(row, key) => {
            if (key === "productName") return `${row.productName} ${row.sku}`;
            if (key === "complianceLevel")
              return (
                <span
                  style={{
                    padding: "2px 8px",
                    fontSize: 11,
                    borderRadius: 4,
                    backgroundColor: levelBg(row.complianceLevel),
                    color: levelColor(row.complianceLevel),
                    border: `1px solid ${levelBorder(row.complianceLevel)}`,
                  }}
                >
                  {row.complianceLevel}
                </span>
              );
            return String((row as Record<string, unknown>)[key] ?? "—");
          }}
        />
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  variant,
  color,
}: {
  label: string;
  value: number | string;
  variant?: "score";
  color?: string;
}) {
  const score = variant === "score" && typeof value === "string" ? parseInt(value, 10) : null;
  return (
    <div
      style={{
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.bgCard,
        padding: "12px 16px",
        textAlign: "center",
      }}
    >
      {variant === "score" && score !== null ? (
        <div style={{ position: "relative", width: 48, height: 48, margin: "0 auto 4px" }}>
          <svg viewBox="0 0 36 36" style={{ width: 48, height: 48, transform: "rotate(-90deg)" }}>
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={
                score >= 80 ? COLORS.success : score > 0 ? COLORS.warning : COLORS.destructive
              }
              strokeWidth="3"
              strokeDasharray={`${(score / 100) * 100} 100`}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {value}
          </span>
        </div>
      ) : (
        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: color ?? COLORS.text, margin: 0 }}>{value}</p>
      )}
      <p style={{ fontSize: 11, fontWeight: 500, color: COLORS.textMuted, marginTop: 4, margin: 0 }}>{label}</p>
    </div>
  );
}

function DonutChart({
  distribution,
  total,
}: {
  distribution: { matched: number; misplaced: number; missing: number; extra: number };
  total: number;
}) {
  if (total === 0) return null;
  const cx = 50;
  const cy = 50;
  const or = 40;
  const ir = 28;
  const segments = [
    { value: distribution.matched, color: COLORS.success },
    { value: distribution.misplaced, color: COLORS.warning },
    { value: distribution.missing, color: COLORS.destructive },
    { value: distribution.extra, color: COLORS.blue },
  ];
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  let startAngle = -90;
  return (
    <div style={{ width: 112, height: 112 }}>
      <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
        {segments.map((s, i) => {
          const angle = (s.value / total) * 360;
          const endAngle = startAngle + angle;
          const x1 = cx + or * Math.cos(toRad(startAngle));
          const y1 = cy + or * Math.sin(toRad(startAngle));
          const x2 = cx + or * Math.cos(toRad(endAngle));
          const y2 = cy + or * Math.sin(toRad(endAngle));
          const x3 = cx + ir * Math.cos(toRad(endAngle));
          const y3 = cy + ir * Math.sin(toRad(endAngle));
          const x4 = cx + ir * Math.cos(toRad(startAngle));
          const y4 = cy + ir * Math.sin(toRad(startAngle));
          const largeArc = angle > 180 ? 1 : 0;
          const path = `M ${x1} ${y1} A ${or} ${or} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${ir} ${ir} 0 ${largeArc} 0 ${x4} ${y4} Z`;
          startAngle = endAngle;
          return <path key={i} d={path} fill={s.color} />;
        })}
      </svg>
    </div>
  );
}

function SimpleTable<T extends Record<string, unknown>>({
  columns,
  data,
  renderCell,
}: {
  columns: { key: string; header: string }[];
  data: T[];
  renderCell: (row: T, key: string) => React.ReactNode;
}) {
  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    backgroundColor: COLORS.bgCard,
    color: COLORS.text,
  };
  const thStyle: React.CSSProperties = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    backgroundColor: "#e8e8e8",
    borderBottom: `2px solid ${COLORS.border}`,
    color: COLORS.text,
  };
  const tdStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: `1px solid ${COLORS.border}`,
    borderRight: `1px dotted ${COLORS.border}`,
    color: COLORS.text,
  };
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} style={thStyle}>
              {c.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={(row.id as string) ?? i} style={{ backgroundColor: i % 2 === 0 ? COLORS.bgCard : "#f5f5f5" }}>
            {columns.map((c) => (
              <td key={c.key} style={tdStyle}>
                {renderCell(row, c.key)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function variantColor(v?: string): string {
  const map: Record<string, string> = {
    matched: COLORS.success,
    misplaced: COLORS.warning,
    missing: COLORS.destructive,
    extra: COLORS.blue,
    depth: COLORS.teal,
    analysis: COLORS.purple,
  };
  return map[v ?? "analysis"] ?? COLORS.purple;
}

function variantBg(v: string): string {
  const map: Record<string, string> = {
    misplaced: "rgba(245, 158, 11, 0.15)",
    missing: "rgba(239, 68, 68, 0.15)",
    extra: "rgba(59, 130, 246, 0.15)",
    depth: "rgba(20, 184, 166, 0.15)",
    analysis: "rgba(167, 139, 250, 0.15)",
  };
  return map[v] ?? "rgba(167, 139, 250, 0.15)";
}

function variantBorder(v: string): string {
  const map: Record<string, string> = {
    misplaced: "rgba(245, 158, 11, 0.4)",
    missing: "rgba(239, 68, 68, 0.4)",
    extra: "rgba(59, 130, 246, 0.4)",
    depth: "rgba(20, 184, 166, 0.4)",
    analysis: "rgba(167, 139, 250, 0.4)",
  };
  return map[v] ?? "rgba(167, 139, 250, 0.4)";
}

function statusBg(s: string): string {
  const map: Record<string, string> = {
    matched: "rgba(16, 185, 130, 0.2)",
    misplaced: "rgba(245, 158, 11, 0.2)",
    missing: "rgba(239, 68, 68, 0.2)",
    extra: "rgba(59, 130, 246, 0.2)",
  };
  return map[s] ?? COLORS.bgMuted;
}

function statusBorder(s: string): string {
  const map: Record<string, string> = {
    matched: "rgba(16, 185, 130, 0.4)",
    misplaced: "rgba(245, 158, 11, 0.4)",
    missing: "rgba(239, 68, 68, 0.4)",
    extra: "rgba(59, 130, 246, 0.4)",
  };
  return map[s] ?? COLORS.border;
}

function severityBg(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.2)",
    MEDIUM: "rgba(245, 158, 11, 0.2)",
    HIGH: "rgba(239, 68, 68, 0.2)",
  };
  return map[s] ?? COLORS.bgMuted;
}

function severityColor(s: string): string {
  const map: Record<string, string> = {
    LOW: COLORS.success,
    MEDIUM: COLORS.warning,
    HIGH: COLORS.destructive,
  };
  return map[s] ?? COLORS.text;
}

function severityBorder(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.4)",
    MEDIUM: "rgba(245, 158, 11, 0.4)",
    HIGH: "rgba(239, 68, 68, 0.4)",
  };
  return map[s] ?? COLORS.border;
}

function levelBg(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.2)",
    MEDIUM: "rgba(245, 158, 11, 0.2)",
    HIGH: "rgba(239, 68, 68, 0.2)",
  };
  return map[s] ?? COLORS.bgMuted;
}

function levelColor(s: string): string {
  const map: Record<string, string> = {
    LOW: COLORS.success,
    MEDIUM: COLORS.warning,
    HIGH: COLORS.destructive,
  };
  return map[s] ?? COLORS.text;
}

function levelBorder(s: string): string {
  const map: Record<string, string> = {
    LOW: "rgba(16, 185, 130, 0.4)",
    MEDIUM: "rgba(245, 158, 11, 0.4)",
    HIGH: "rgba(239, 68, 68, 0.4)",
  };
  return map[s] ?? COLORS.border;
}
