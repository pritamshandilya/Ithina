/**
 * API Response Types – Reports
 *
 * Shapes returned by compliance report and detailed analysis endpoints.
 */

// ─── Compliance Report (per audit) ────────────────────────────────────────────

export interface ComplianceReportResponse {
  auditId: string;
  report: ReportSnippetResponse;
  allItems: AllItemsReportResponse;
  allIssues: AllIssuesReportResponse;
  imageComparison: ImageComparisonResponse;
}

export interface ReportSnippetResponse {
  auditId: string;
  planogramName?: string;
  complianceScore: number;
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
  issues: number;
  facings: number;
  units: number;
  detected: number;
  gap: number;
  productsDetected: number;
  analysisIssues: number;
  executiveSummary: string;
  keyFindings: KeyFindingResponse[];
  shelfCompliance: ShelfComplianceResponse[];
  issueDistribution: IssueDistributionResponse;
  issueCategories: IssueCategoryResponse[];
  aiRecommendations: string[];
  issuesToReview: string[];
}

export interface KeyFindingResponse {
  id: string;
  type: "error" | "warning" | "info";
  text: string;
}

export interface ShelfComplianceResponse {
  shelfName: string;
  compliance: number;
}

export interface IssueDistributionResponse {
  matched: number;
  misplaced: number;
  missing: number;
  extra: number;
}

export interface IssueCategoryResponse {
  id: string;
  title: string;
  count: number;
}

// ─── All Items Report ─────────────────────────────────────────────────────────

export interface AllItemsReportResponse {
  skuFacings: SkuFacingRowResponse[];
  planogramItems: PlanogramItemRowResponse[];
}

export interface SkuFacingRowResponse {
  id: string;
  sku: string;
  productName: string;
  frontFacings: number;
  detected: number;
  depth: number;
  totalExpected: number;
  facingDiff: number;
  facingDiffText: string;
  facingDiffVariant: "ok" | "short" | "extra";
}

export interface PlanogramItemRowResponse {
  id: string;
  sku: string;
  productName: string;
  shelf: string;
  issueDescription?: string;
  complianceLevel: number;
}

// ─── All Issues Report ────────────────────────────────────────────────────────

export type IssueCategoryVariantResponse =
  | "misplaced"
  | "missing"
  | "extra"
  | "depth"
  | "analysis";

export interface AllIssuesReportResponse {
  categories: IssueCategoryGroupResponse[];
}

export interface IssueCategoryGroupResponse {
  id: string;
  variant: IssueCategoryVariantResponse;
  title: string;
  description: string;
  issues: IssueEntryResponse[];
}

export interface IssueEntryResponse {
  id: string;
  sku?: string;
  productName: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  shelf?: string;
  slot?: string;
  expected?: string;
  actual?: string;
}

// ─── Image Comparison ─────────────────────────────────────────────────────────

export interface ImageComparisonResponse {
  planogramShelves: PlanogramShelfRowResponse[];
  detectionOverlays: DetectionOverlayResponse[];
}

export interface PlanogramShelfRowResponse {
  shelfName: string;
  shelfLabel?: string;
  units: number;
  slots: PlanogramSlotResponse[];
}

export type PlanogramSlotStatusResponse =
  | "matched"
  | "misplaced"
  | "missing"
  | "extra";

export interface PlanogramSlotResponse {
  id: string;
  productName: string;
  shortName: string;
  expectedFacings: number;
  detectedFacings: number;
  depth: number;
  totalExpectedUnits: number;
  totalDetectedUnits: number;
  status: PlanogramSlotStatusResponse;
  severity?: "LOW" | "MEDIUM" | "HIGH";
  highDemand?: boolean;
  shape?: string;
  color?: string;
}

export type DetectionOverlayStatusResponse =
  | "compliant"
  | "misplaced"
  | "missing"
  | "extra";

export interface DetectionOverlayResponse {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  status: DetectionOverlayStatusResponse;
  shelfIndex: number;
  tooltip?: string;
}

// ─── Detailed Report (Analytics) ─────────────────────────────────────────────

export interface DetailedReportResponse {
  reportId: string;
  title: string;
  date: string; // ISO date string
  store: string;
  complianceScore: number;
  totalProducts: number;
  totalIssues: number;
  auditCoverage: number;
  alertsTriggered: number;
  overrideRate: number;
  anomalyConfidence: number;
  riskScore: string;
  revenueAtRisk: number;
  issueBreakdown: IssueBreakdownResponse[];
  trendData: TrendDataPointResponse[];
  heatmapData: HeatmapCellResponse[];
  topViolations: TopViolationResponse[];
}

export interface IssueBreakdownResponse {
  label: string;
  value: number;
  color: string;
}

export interface TrendDataPointResponse {
  label: string;
  compliance: number;
  issues: number;
}

export interface HeatmapCellResponse {
  zone: string;
  day: string;
  value: number;
}

export interface TopViolationResponse {
  rule: string;
  count: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
}

// ─── Report Lists ─────────────────────────────────────────────────────────────

export interface ShelfSummaryResponse {
  id: string;
  shelf: string;
  latestAnalysis?: string;
  lastUpdated: string;
  products: number;
  issues: number;
  runs: number;
  status: string;
  _children?: ShelfSummaryResponse[];
}

export interface AdhocReportResponse {
  id: string;
  name: string;
  date: string;
  products: number;
  issues: number;
  status: string;
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}
