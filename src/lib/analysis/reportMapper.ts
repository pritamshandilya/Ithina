import type { AllIssuesReportData } from "./allIssuesReportTypes";
import type { AllItemsReportData } from "./allItemsReportTypes";
import type { ReportSnippet } from "./reportSnippetTypes";
import type {
  AnalysisJobResult,
  PlanogramDiffIssue,
} from "@/models/response/analysis";
import type { PlanogramPayload } from "@/types/planogram";

const DEFAULT_REPORT_SNIPPET: ReportSnippet = {
  productsDetected: 0,
  analysisIssues: 0,
  complianceScore: 0,
  matched: 0,
  misplaced: 0,
  missing: 0,
  extra: 0,
  issues: 0,
  facings: 0,
  units: 0,
  detected: 0,
  gap: 0,
  executiveSummary:
    "Analysis completed. Detailed result mapping is unavailable for this job payload.",
  keyFindings: [],
  aiRecommendations: [],
  issueDistribution: {
    matched: 0,
    misplaced: 0,
    missing: 0,
    extra: 0,
  },
  issueCategories: [],
  issuesToReview: [],
  shelfCompliance: [],
};

function parseNumericValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeIssueName(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isMissingIssueType(type: string | undefined): boolean {
  const normalized = (type ?? "").trim().toUpperCase();
  return normalized === "MISSING_PRODUCT" || normalized === "FACING_SHORTAGE";
}

function isMisplacedIssueType(type: string | undefined): boolean {
  return (type ?? "").trim().toUpperCase() === "MISPLACED_PRODUCT";
}

function isUnexpectedIssueType(type: string | undefined): boolean {
  return (type ?? "").trim().toUpperCase() === "UNEXPECTED_PRODUCT";
}

function shelfNumberFromIssue(issue: PlanogramDiffIssue): number | null {
  if (typeof issue.row === "number" && Number.isFinite(issue.row)) {
    return issue.row;
  }
  if (!issue.shelf_name) return null;
  const parsed = Number.parseInt(issue.shelf_name.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function estimateIssueWeight(issue: PlanogramDiffIssue): number {
  const payload = issue as Record<string, unknown>;
  if (isMissingIssueType(issue.type)) {
    const expectedFacings = parseNumericValue(payload.expected_facings);
    const detectedFacings = parseNumericValue(payload.detected_facings);
    return Math.max(expectedFacings - detectedFacings, 1);
  }
  const detectedFacings = parseNumericValue(payload.detected_facings);
  return Math.max(detectedFacings, 1);
}
export function getAnnotatedImagePreview(
  result: AnalysisJobResult | null,
  _imageMimeType?: string | null,
): string | null {
  void _imageMimeType;
  if (!result) return null;
  return typeof result.annotated_image === "string"
    ? result.annotated_image
    : null;
}

export function mapAnalysisResultToReportSnippet(
  result: AnalysisJobResult | null,
): ReportSnippet {
  if (!result) return DEFAULT_REPORT_SNIPPET;

  const summary = result.summary;
  const compliance = result.compliance;
  const rows = result.rows;
  const planogramDiff = result.planogram_diff;
  const diffIssues = planogramDiff?.issues ?? [];
  const emptySpaces = Array.isArray(result.empty_spaces)
    ? result.empty_spaces
    : [];
  const gapFromEmptySpaces = emptySpaces.reduce((total, space) => {
    const typedSpace = space as {
      missing_facings?: unknown;
      gap_size?: unknown;
      width?: unknown;
    };
    const missingFacings = parseNumericValue(typedSpace.missing_facings);
    if (missingFacings > 0) return total + missingFacings;
    const gapSize =
      parseNumericValue(typedSpace.gap_size) ||
      parseNumericValue(typedSpace.width);
    return total + (gapSize > 0 ? 1 : 0);
  }, 0);
  const detected =
    parseNumericValue(planogramDiff?.detected_total) ||
    parseNumericValue(result.count) ||
    parseNumericValue(summary.total) ||
    parseNumericValue(result.detections.length);
  const expectedTotal = parseNumericValue(planogramDiff?.expected_total);
  const missingFromDiff = diffIssues.filter((issue) =>
    isMissingIssueType(issue.type),
  ).length;
  const misplaced = diffIssues.filter((issue) =>
    isMisplacedIssueType(issue.type),
  ).length;
  const extra = diffIssues.filter((issue) =>
    isUnexpectedIssueType(issue.type),
  ).length;
  const diffIssueCount = diffIssues.length;
  const missing =
    missingFromDiff > 0
      ? missingFromDiff
      : parseNumericValue(result.empty_count) > 0
        ? gapFromEmptySpaces
        : 0;
  const baselineRuleFailures = compliance.rules.filter(
    (rule) => !rule.passed && rule.reason !== "Evaluation unavailable",
  );
  const analysisIssues =
    diffIssueCount > 0 ? diffIssueCount : baselineRuleFailures.length;
  const matched =
    expectedTotal > 0
      ? Math.max(expectedTotal - missing - misplaced, 0)
      : Math.max(detected - parseNumericValue(summary.failed), 0);
  const complianceScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        parseNumericValue(planogramDiff?.compliance_pct) ||
          parseNumericValue(compliance.score),
      ),
    ),
  );

  const shelfPenaltyByNumber = new Map<number, number>();
  for (const issue of diffIssues) {
    const shelfNumber = shelfNumberFromIssue(issue);
    if (shelfNumber === null) continue;
    const currentPenalty = shelfPenaltyByNumber.get(shelfNumber) ?? 0;
    shelfPenaltyByNumber.set(
      shelfNumber,
      currentPenalty + estimateIssueWeight(issue),
    );
  }

  const shelfCompliance = rows.map((row, index) => {
    const shelfNumber = parseNumericValue(row.row_number) || index + 1;
    const shelfUnits = parseNumericValue(row.count);
    const shelfPenalty = shelfPenaltyByNumber.get(shelfNumber) ?? 0;
    const shelfDenominator = Math.max(shelfUnits + shelfPenalty, 1);
    const shelfScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          ((shelfDenominator - shelfPenalty) / shelfDenominator) * 100,
        ),
      ),
    );

    return {
      shelfName: `Shelf ${shelfNumber}`,
      compliance: shelfScore,
      units: shelfUnits,
      skuCount: shelfUnits,
    };
  });

  const issuesToReview =
    diffIssueCount > 0
      ? diffIssues.map((issue, index) => {
          const shelfNumber = shelfNumberFromIssue(issue);
          return {
            id: `${issue.type ?? "ISSUE"}-${index}`,
            skuName: issue.name ?? undefined,
            description: issue.detail ?? "Detected planogram compliance issue.",
            type: issue.type ?? "ANALYSIS",
            location:
              shelfNumber !== null
                ? `Shelf ${shelfNumber}`
                : (issue.shelf_name ?? undefined),
          };
        })
      : baselineRuleFailures.slice(0, 6).map((rule, index) => ({
          id: `${rule.id}-${index}`,
          skuName: rule.name,
          description: rule.reason || "Compliance rule evaluation failed.",
          type: rule.category || "ANALYSIS",
          location: undefined,
        }));

  const aiRecommendations =
    (planogramDiff?.action_items ?? []).length > 0
      ? (planogramDiff?.action_items ?? [])
      : baselineRuleFailures
          .slice(0, 3)
          .map((rule) => `Review "${rule.name}" - ${rule.reason}`);
  const finalRecommendations = aiRecommendations;

  const keyFindings = [
    {
      type: complianceScore === 0 ? "error" : "info",
      text: `Compliance score is ${complianceScore}%.`,
    },
    {
      type: missing > 0 ? "warning" : "info",
      text:
        missing > 0
          ? `Detected ${missing} missing facings across ${parseNumericValue(result.empty_count)} empty spaces.`
          : "No missing facings detected from spacing analysis.",
    },
    {
      type: analysisIssues > 0 ? "warning" : "info",
      text:
        analysisIssues > 0
          ? `${analysisIssues} compliance/analysis issue${analysisIssues === 1 ? "" : "s"} require review.`
          : "No compliance issues reported.",
    },
  ] as const;

  return {
    ...DEFAULT_REPORT_SNIPPET,
    complianceScore,
    productsDetected: detected,
    analysisIssues,
    matched,
    misplaced,
    missing,
    extra,
    issues: analysisIssues,
    facings: expectedTotal > 0 ? expectedTotal : detected,
    units: detected,
    detected,
    gap:
      expectedTotal > 0
        ? Math.max(expectedTotal - detected, 0)
        : parseNumericValue(result.empty_count) > 0
          ? gapFromEmptySpaces
          : 0,
    shelfCompliance,
    issueDistribution: { matched, misplaced, missing, extra },
    issueCategories: [
      ...(missing > 0
        ? [
            {
              id: "missing",
              title: "Missing Products",
              count: missing,
              description: "Expected items not detected on shelf.",
              variant: "missing" as const,
            },
          ]
        : []),
      ...(misplaced > 0
        ? [
            {
              id: "misplaced",
              title: "Misplaced Products",
              count: misplaced,
              description: "Products detected in wrong shelf location.",
              variant: "misplaced" as const,
            },
          ]
        : []),
      ...(extra > 0
        ? [
            {
              id: "extra",
              title: "Unexpected Products",
              count: extra,
              description: "Detected items outside the expected planogram.",
              variant: "extra" as const,
            },
          ]
        : []),
      ...(analysisIssues > 0 && diffIssueCount === 0
        ? [
            {
              id: "analysis",
              title: "Analysis Issues",
              count: analysisIssues,
              description: "Issues reported by compliance rule evaluation.",
              variant: "analysis" as const,
            },
          ]
        : []),
    ],
    issuesToReview,
    keyFindings: keyFindings.map((finding) => ({ ...finding })),
    executiveSummary:
      (planogramDiff?.summary as string | undefined) ??
      (summary as unknown as { executive_summary?: string })
        .executive_summary ??
      (analysisIssues > 0
        ? `Detected ${detected} products with ${analysisIssues} issue${analysisIssues === 1 ? "" : "s"} and ${parseNumericValue(result.empty_count)} empty-space gap${parseNumericValue(result.empty_count) === 1 ? "" : "s"}.`
        : DEFAULT_REPORT_SNIPPET.executiveSummary),
    aiRecommendations: finalRecommendations,
  };
}

export function mapAnalysisResultToAllItemsReportData(
  result: AnalysisJobResult | null,
): AllItemsReportData {
  if (!result) return { planogramItems: [], skuFacings: [] };

  const diffIssues = result.planogram_diff?.issues ?? [];
  const issueQueueByNameAndShelf = new Map<
    string,
    Array<
      Record<string, unknown> & {
        type?: string;
        detail?: string;
        name?: string;
      }
    >
  >();
  const issueQueueByName = new Map<
    string,
    Array<
      Record<string, unknown> & {
        type?: string;
        detail?: string;
        name?: string;
      }
    >
  >();

  for (const issue of diffIssues) {
    const normalizedName = normalizeIssueName(issue.name);
    if (!normalizedName) continue;
    const issueRecord = issue as Record<string, unknown> & {
      type?: string;
      detail?: string;
      name?: string;
    };
    const shelfNumber = shelfNumberFromIssue(issue);
    if (shelfNumber !== null) {
      const key = `${normalizedName}::${shelfNumber}`;
      const queue = issueQueueByNameAndShelf.get(key) ?? [];
      queue.push(issueRecord);
      issueQueueByNameAndShelf.set(key, queue);
      continue;
    }
    const queue = issueQueueByName.get(normalizedName) ?? [];
    queue.push(issueRecord);
    issueQueueByName.set(normalizedName, queue);
  }

  const grouped = new Map<
    string,
    { name: string; row: number; count: number }
  >();
  for (const detection of result.detections) {
    const name = detection.details.name?.trim() || "Unknown";
    const row = detection.row_number;
    const key = `${name}::${row}`;
    const current = grouped.get(key);
    if (current) {
      current.count += 1;
    } else {
      grouped.set(key, { name, row, count: 1 });
    }
  }

  const entries = Array.from(grouped.entries());
  return {
    planogramItems: entries.map(([key, item], index) => {
      const normalizedName = normalizeIssueName(item.name);
      const shelfKey = `${normalizedName}::${item.row}`;
      const issue =
        issueQueueByNameAndShelf.get(shelfKey)?.shift() ??
        issueQueueByName.get(normalizedName)?.shift();
      const issueType = (issue?.type ?? "").toUpperCase();
      const status =
        issueType === "UNEXPECTED_PRODUCT"
          ? "extra"
          : issueType === "MISPLACED_PRODUCT"
            ? "misplaced"
            : issueType === "MISSING_PRODUCT" || issueType === "FACING_SHORTAGE"
              ? "missing"
              : "matched";
      const complianceLevel =
        status === "missing"
          ? "HIGH"
          : status === "misplaced" || status === "extra"
            ? "MEDIUM"
            : "LOW";
      return {
        id: `pi-${index + 1}`,
        productName: item.name,
        sku: key.replace("::", "-"),
        shelf: `Shelf ${item.row}`,
        status,
        complianceLevel,
        issueDescription: issue?.detail,
      };
    }),
    skuFacings: entries.map(([key, item], index) => {
      const normalizedName = normalizeIssueName(item.name);
      const shelfKey = `${normalizedName}::${item.row}`;
      const issue =
        issueQueueByNameAndShelf.get(shelfKey)?.[0] ??
        issueQueueByName.get(normalizedName)?.[0];
      const issueType = String(issue?.type ?? "").toUpperCase();
      const expectedFacings =
        parseNumericValue(issue?.expected_facings) || item.count;
      const detectedFacings =
        parseNumericValue(issue?.detected_facings) ||
        parseNumericValue(issue?.detected_count) ||
        item.count;
      const diff = detectedFacings - expectedFacings;
      const facingDiffVariant: "ok" | "short" | "extra" =
        issueType === "UNEXPECTED_PRODUCT" || diff > 0
          ? "extra"
          : issueType === "FACING_SHORTAGE" ||
              issueType === "MISSING_PRODUCT" ||
              diff < 0
            ? "short"
            : "ok";
      const facingDiffText =
        facingDiffVariant === "ok"
          ? "OK"
          : facingDiffVariant === "short"
            ? `${Math.abs(diff || 1)} short`
            : `+${Math.abs(diff || 1)} extra`;
      return {
        id: `sf-${index + 1}`,
        productName: item.name,
        sku: key.replace("::", "-"),
        frontFacings: expectedFacings,
        detected: detectedFacings,
        depth: 1,
        totalExpected: expectedFacings,
        facingDiffText,
        facingDiffVariant,
      };
    }),
  };
}

export function mapAnalysisResultToAllIssuesReportData(
  result: AnalysisJobResult | null,
): AllIssuesReportData {
  if (!result) {
    return { categories: [] };
  }

  const baselineRuleFailures = result.compliance.rules.filter(
    (rule) => !rule.passed && rule.reason !== "Evaluation unavailable",
  );
  const diffIssues = result.planogram_diff?.issues ?? [];
  if (diffIssues.length === 0) {
    if (baselineRuleFailures.length === 0) return { categories: [] };
    return {
      categories: [
        {
          id: "analysis",
          title: "Analysis Issues",
          count: baselineRuleFailures.length,
          description: "Issues reported by compliance rule evaluation.",
          variant: "analysis",
          issues: baselineRuleFailures.map((rule, index) => {
            const severity = parseNumericValue(rule.severity);
            return {
              id: `analysis-${rule.id}-${index + 1}`,
              productName: rule.name || "Compliance Rule",
              description: rule.reason || "Compliance rule evaluation failed.",
              detail: rule.description || undefined,
              why: rule.category || undefined,
              severity:
                severity >= 80 ? "HIGH" : severity >= 50 ? "MEDIUM" : "LOW",
            };
          }),
        },
      ],
    };
  }

  const byType = {
    missing: diffIssues.filter((i) => isMissingIssueType(i.type)),
    misplaced: diffIssues.filter((i) => isMisplacedIssueType(i.type)),
    extra: diffIssues.filter((i) => isUnexpectedIssueType(i.type)),
  };

  return {
    categories: [
      ...(byType.missing.length > 0
        ? [
            {
              id: "missing",
              title: "Missing Products",
              count: byType.missing.length,
              description: "Expected items not detected on shelf.",
              variant: "missing" as const,
              issues: byType.missing.map((issue, index) => ({
                id: `missing-${index + 1}`,
                productName: issue.name ?? "Unknown",
                description: issue.detail ?? "Missing product",
                detail: issue.shelf_name ?? undefined,
                severity: "HIGH" as const,
              })),
            },
          ]
        : []),
      ...(byType.misplaced.length > 0
        ? [
            {
              id: "misplaced",
              title: "Misplaced Products",
              count: byType.misplaced.length,
              description: "Products detected in wrong shelf location.",
              variant: "misplaced" as const,
              issues: byType.misplaced.map((issue, index) => ({
                id: `misplaced-${index + 1}`,
                productName: issue.name ?? "Unknown",
                description: issue.detail ?? "Misplaced product",
                detail: issue.shelf_name ?? undefined,
                severity: "MEDIUM" as const,
              })),
            },
          ]
        : []),
      ...(byType.extra.length > 0
        ? [
            {
              id: "extra",
              title: "Unexpected Products",
              count: byType.extra.length,
              description: "Detected items outside expected planogram.",
              variant: "extra" as const,
              issues: byType.extra.map((issue, index) => ({
                id: `extra-${index + 1}`,
                productName: issue.name ?? "Unknown",
                description: issue.detail ?? "Unexpected product",
                detail: issue.shelf_name ?? undefined,
                severity: "MEDIUM" as const,
              })),
            },
          ]
        : []),
    ],
  };
}

export function mapPlanogramPayloadToAllItemsReportData(
  planogramPayload: PlanogramPayload | null,
  result: AnalysisJobResult | null,
): AllItemsReportData {
  if (!planogramPayload) return mapAnalysisResultToAllItemsReportData(result);

  const issues = result?.planogram_diff?.issues ?? [];
  const issueQueueByNameAndShelf = new Map<
    string,
    Array<{ type?: string; detail?: string }>
  >();
  const issueQueueByName = new Map<
    string,
    Array<{ type?: string; detail?: string }>
  >();

  for (const issue of issues) {
    const normalizedName = normalizeIssueName(issue.name);
    if (!normalizedName) continue;
    const issueEntry = { type: issue.type, detail: issue.detail };
    const shelfNumber = shelfNumberFromIssue(issue);
    if (shelfNumber !== null) {
      const shelfKey = `${normalizedName}::${shelfNumber}`;
      const byShelf = issueQueueByNameAndShelf.get(shelfKey) ?? [];
      byShelf.push(issueEntry);
      issueQueueByNameAndShelf.set(shelfKey, byShelf);
      continue;
    }
    const byName = issueQueueByName.get(normalizedName) ?? [];
    byName.push(issueEntry);
    issueQueueByName.set(normalizedName, byName);
  }

  const planogramItems = planogramPayload.shelves.flatMap((shelf, shelfIndex) =>
    shelf.products.map((product, productIndex) => {
      const normalizedName = normalizeIssueName(product.name);
      const shelfKey = `${normalizedName}::${shelfIndex + 1}`;
      const issue =
        issueQueueByNameAndShelf.get(shelfKey)?.shift() ??
        issueQueueByName.get(normalizedName)?.shift();
      const status =
        issue?.type === "MISSING_PRODUCT"
          ? "missing"
          : issue?.type === "MISPLACED_PRODUCT"
            ? "misplaced"
            : issue?.type === "UNEXPECTED_PRODUCT"
              ? "extra"
              : "matched";
      const complianceLevel =
        status === "missing"
          ? "HIGH"
          : status === "misplaced" || status === "extra"
            ? "MEDIUM"
            : "LOW";

      return {
        id: `pi-${shelf.id}-${productIndex + 1}`,
        productName: product.name,
        sku: product.sku ?? `${shelf.id}-${productIndex + 1}`,
        shelf: `Shelf ${shelfIndex + 1}`,
        status,
        complianceLevel,
        issueDescription: issue?.detail,
      } as const;
    }),
  );

  // Keep SKU facings derived from detections/Observed Fixture, while planogram
  // items remain the expected layout from planogram payload.
  const detectedItems = mapAnalysisResultToAllItemsReportData(result);

  return {
    planogramItems,
    skuFacings: detectedItems.skuFacings,
  };
}
