/**
 * ReportPdfDocument – @react-pdf/renderer document
 *
 * Renders the Combined Compliance & Analysis Report as a native PDF.
 * No DOM/canvas – direct PDF generation. Immune to oklch/oklab CSS issues.
 */

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportPdfData } from "@/types/reports";
import {
  MOCK_ALL_ITEMS_REPORT,
  MOCK_ALL_ISSUES_REPORT,
  MOCK_IMAGE_COMPARISON,
} from "@/lib/analysis";
import {
  severityBg,
  severityBorder,
  severityColor,
  statusBg,
  statusBorder,
  variantBg,
  variantBorder,
} from "./report-pdf-color-utils";

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

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  section: { marginBottom: 16 },
  heading: {
    fontSize: 11,
    fontWeight: 600,
    color: COLORS.text,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: { fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 10, color: COLORS.textMuted, marginBottom: 12 },
  card: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    padding: 12,
    marginBottom: 10,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    width: "15%",
    minWidth: 50,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
    padding: 8,
    alignItems: "center",
  },
  metricValue: { fontSize: 12, fontWeight: 700, color: COLORS.text },
  metricLabel: { fontSize: 9, color: COLORS.textMuted, marginTop: 2 },
  twoCol: { flexDirection: "row", gap: 16, marginBottom: 12 },
  col: { flex: 1 },
  threeCol: { flexDirection: "row", gap: 12, marginBottom: 12 },
  barBg: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.bgMuted,
    borderRadius: 2,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: COLORS.success },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 9,
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  table: { width: "100%", marginBottom: 12 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e8e8e8",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    fontWeight: 600,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    borderStyle: "dotted",
  },
  issueCard: {
    padding: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 6,
  },
  noImage: {
    padding: 24,
    textAlign: "center",
    color: COLORS.textMuted,
    backgroundColor: COLORS.bgMuted,
    borderRadius: 4,
  },
});

export interface ReportPdfDocumentProps {
  data: ReportPdfData;
}

export function ReportPdfDocument({ data }: ReportPdfDocumentProps) {
  const { report, imageUrl, allItems, allIssues, imageComparison } = data;
  const items = allItems ?? MOCK_ALL_ITEMS_REPORT;
  const issues = allIssues ?? MOCK_ALL_ISSUES_REPORT;
  const imgData = imageComparison ?? MOCK_IMAGE_COMPARISON;

  const subtitle = report.planogramName
    ? `Planogram "${report.planogramName}" • ${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`
    : `${report.productsDetected} products detected • ${report.analysisIssues} analysis issues`;

  return (
    <Document title="Compliance Report">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.title}>Combined Compliance & Analysis Report</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Metrics */}
        <View style={[styles.section, styles.metricsRow]}>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: report.complianceScore >= 80 ? COLORS.success : report.complianceScore > 0 ? COLORS.warning : COLORS.destructive }]}>
              {report.complianceScore}%
            </Text>
            <Text style={styles.metricLabel}>Compliance</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.success }]}>{report.matched}</Text>
            <Text style={styles.metricLabel}>Matched</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.warning }]}>{report.misplaced}</Text>
            <Text style={styles.metricLabel}>Misplaced</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.destructive }]}>{report.missing}</Text>
            <Text style={styles.metricLabel}>Missing</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.blue }]}>{report.extra}</Text>
            <Text style={styles.metricLabel}>Extra</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.warning }]}>{report.issues}</Text>
            <Text style={styles.metricLabel}>Issues</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{report.facings}</Text>
            <Text style={styles.metricLabel}>Facings</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{report.units}</Text>
            <Text style={styles.metricLabel}>Units</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{report.detected}</Text>
            <Text style={styles.metricLabel}>Detected</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.destructive }]}>{report.gap}</Text>
            <Text style={styles.metricLabel}>Gap</Text>
          </View>
        </View>

        {/* Overview & Charts */}
        <View style={styles.section}>
          <Text style={styles.heading}>Overview & Charts</Text>
          <View style={styles.twoCol}>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 6 }]}>Executive Summary</Text>
              <Text style={{ fontSize: 10, color: COLORS.text, marginBottom: 8 }}>{report.executiveSummary}</Text>
              {report.keyFindings.map((f, i) => (
                <View
                  key={i}
                  style={{
                    padding: 6,
                    marginBottom: 6,
                    borderRadius: 4,
                    backgroundColor:
                      f.type === "error"
                        ? "rgba(239, 68, 68, 0.1)"
                        : f.type === "warning"
                          ? "rgba(245, 158, 11, 0.1)"
                          : "rgba(167, 139, 250, 0.1)",
                    borderWidth: 1,
                    borderColor:
                      f.type === "error"
                        ? "rgba(239, 68, 68, 0.3)"
                        : f.type === "warning"
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(167, 139, 250, 0.3)",
                  }}
                >
                  <Text style={{ fontSize: 9, color: COLORS.text }}>{f.text}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 6 }]}>AI Recommendations</Text>
              {report.aiRecommendations.map((rec, i) => (
                <Text key={i} style={{ fontSize: 9, color: COLORS.text, marginBottom: 4 }}>
                  • {rec}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.threeCol}>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>Compliance by Shelf</Text>
              {report.shelfCompliance.map((s) => (
                <View key={s.shelfName} style={styles.row}>
                  <Text style={{ width: 60, fontSize: 9, color: COLORS.text }}>{s.shelfName}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${s.compliance}%`,
                          backgroundColor:
                            s.compliance >= 80 ? COLORS.success : s.compliance > 0 ? COLORS.warning : COLORS.destructive,
                        },
                      ]}
                    />
                  </View>
                  <Text style={{ fontSize: 9, fontWeight: 600, color: COLORS.text, width: 24, textAlign: "right" }}>
                    {s.compliance}%
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>Issue Distribution</Text>
              <View style={styles.row}>
                <Text style={{ fontSize: 9, color: COLORS.text }}>Matched: {report.issueDistribution.matched}</Text>
              </View>
              <View style={styles.row}>
                <Text style={{ fontSize: 9, color: COLORS.text }}>Misplaced: {report.issueDistribution.misplaced}</Text>
              </View>
              <View style={styles.row}>
                <Text style={{ fontSize: 9, color: COLORS.text }}>Missing: {report.issueDistribution.missing}</Text>
              </View>
              <View style={styles.row}>
                <Text style={{ fontSize: 9, color: COLORS.text }}>Extra: {report.issueDistribution.extra}</Text>
              </View>
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>All Issues Breakdown</Text>
              {report.issueCategories.map((cat) => (
                <View key={cat.id} style={styles.row}>
                  <Text style={{ width: 80, fontSize: 9, color: COLORS.text }}>{cat.title}</Text>
                  <Text style={{ fontSize: 9, fontWeight: 600, color: COLORS.text }}>{cat.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Image Comparison */}
        <View style={styles.section}>
          <Text style={styles.heading}>Image Comparison</Text>
          <Text style={[styles.subtitle, { marginBottom: 6 }]}>
            Side-by-side comparison: Planogram (expected layout) vs Real Shelf (captured image).
          </Text>
          <View style={styles.twoCol}>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>Planogram (Expected)</Text>
              {imgData.planogramShelves.map((shelf) => (
                <View key={shelf.shelfName} style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 9, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                    {shelf.shelfName}: {shelf.shelfLabel ?? ""} — {shelf.units} UNITS
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {shelf.slots.map((slot) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.pill,
                          {
                            backgroundColor: statusBg(slot.status),
                            borderWidth: 1,
                            borderColor: statusBorder(slot.status),
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 8, color: COLORS.text }}>
                          {slot.shortName} {slot.detectedFacings}/{slot.expectedFacings} D{slot.depth}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>Real Shelf (Captured)</Text>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
                />
              ) : (
                <View style={styles.noImage}>
                  <Text style={{ fontSize: 10 }}>No shelf image available</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* All Issues */}
        <View style={styles.section}>
          <Text style={styles.heading}>All Issues</Text>
          {issues.categories.map((category) => (
            <View
              key={category.id}
              style={[
                styles.card,
                {
                  backgroundColor: variantBg(category.variant),
                  borderColor: variantBorder(category.variant),
                },
              ]}
            >
              <Text style={{ fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>
                {category.title} {category.issues.length}
              </Text>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>{category.description}</Text>
              {category.issues.map((issue) => (
                <View key={issue.id} style={styles.issueCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View>
                      <Text style={{ fontWeight: 600, color: COLORS.text, fontSize: 9 }}>{issue.productName}</Text>
                      <Text style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 2 }}>{issue.description}</Text>
                    </View>
                    <View
                      style={{
                        paddingVertical: 2,
                        paddingHorizontal: 6,
                        borderRadius: 2,
                        backgroundColor: severityBg(issue.severity),
                        borderWidth: 1,
                        borderColor: severityBorder(issue.severity),
                      }}
                    >
                      <Text style={{ fontSize: 8, color: severityColor(issue.severity), fontWeight: 600 }}>
                        {issue.severity}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* All Items */}
        <View style={styles.section}>
          <Text style={styles.heading}>All Items</Text>
          <Text style={[styles.subtitle, { marginBottom: 6 }]}>SKU Facings & Depth Summary</Text>
          <PdfTable
            columns={[
              { key: "productName", header: "SKU / Product", flex: 2 },
              { key: "frontFacings", header: "Front", flex: 1 },
              { key: "detected", header: "Detected", flex: 1 },
              { key: "depth", header: "Depth", flex: 1 },
              { key: "totalExpected", header: "Expected", flex: 1 },
              { key: "facingDiffText", header: "Facing Diff", flex: 1 },
              { key: "facingDiffVariant", header: "Status", flex: 1 },
            ]}
            data={items.skuFacings}
            renderCell={(row, key) => {
              if (key === "productName") return `${row.productName} (${row.sku})`;
              if (key === "facingDiffVariant")
                return row.facingDiffVariant === "ok" ? "OK" : row.facingDiffVariant === "extra" ? "Extra" : "Short";
              return String((row as unknown as Record<string, unknown>)[key] ?? "—");
            }}
          />
          <Text style={[styles.subtitle, { marginTop: 12, marginBottom: 6 }]}>
            All Planogram Items ({items.planogramItems.length})
          </Text>
          <PdfTable
            columns={[
              { key: "productName", header: "Product / SKU", flex: 2 },
              { key: "issueDescription", header: "Issue", flex: 2 },
              { key: "shelf", header: "Shelf", flex: 1 },
              { key: "complianceLevel", header: "Severity", flex: 1 },
            ]}
            data={items.planogramItems}
            renderCell={(row, key) => {
              if (key === "productName") return `${row.productName} ${row.sku}`;
              if (key === "complianceLevel") return String(row.complianceLevel);
              return String((row as unknown as Record<string, unknown>)[key] ?? "—");
            }}
          />
        </View>
      </Page>
    </Document>
  );
}

function PdfTable<T extends { id?: string }>({
  columns,
  data,
  renderCell,
}: {
  columns: { key: string; header: string; flex: number }[];
  data: T[];
  renderCell: (row: T, key: string) => string;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {columns.map((c) => (
          <View key={c.key} style={[styles.tableCell, { flex: c.flex }]}>
            <Text style={{ fontSize: 9, fontWeight: 600 }}>{c.header}</Text>
          </View>
        ))}
      </View>
      {data.map((row, i) => (
        <View
          key={(row.id as string) ?? i}
          style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? COLORS.bgCard : "#f5f5f5" }]}
        >
          {columns.map((c) => (
            <View key={c.key} style={[styles.tableCell, { flex: c.flex }]}>
              <Text style={{ fontSize: 8, color: COLORS.text }}>{renderCell(row, c.key)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

