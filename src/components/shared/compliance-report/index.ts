/**
 * Compliance Report – Full report components
 *
 * Shared between Maker and Checker flows.
 * PDF-export friendly structure.
 */

export { ComplianceReportHeader } from "./ComplianceReportHeader";
export type { ComplianceReportHeaderProps } from "./ComplianceReportHeader";

export { ComplianceReportMetrics } from "./ComplianceReportMetrics";
export type { ComplianceReportMetricsProps } from "./ComplianceReportMetrics";

export { ComplianceReportTabs } from "./ComplianceReportTabs";
export type {
  ComplianceReportTabsProps,
  ReportTabId,
  ReportTabDef,
} from "./ComplianceReportTabs";

export { OverviewChartsTab } from "./OverviewChartsTab";
export type { OverviewChartsTabProps } from "./OverviewChartsTab";

export { AllItemsTab } from "./AllItemsTab";
export type { AllItemsTabProps } from "./AllItemsTab";

export { AllIssuesTab } from "./AllIssuesTab";
export type { AllIssuesTabProps } from "./AllIssuesTab";

export { ComplianceReportFull } from "./ComplianceReportFull";
export type { ComplianceReportFullProps } from "./ComplianceReportFull";

export { PlanogramExpectedPanel } from "./PlanogramExpectedPanel";
export type { PlanogramExpectedPanelProps } from "./PlanogramExpectedPanel";

export { ImageComparisonTab } from "./ImageComparisonTab";
export type { ImageComparisonTabProps } from "./ImageComparisonTab";

export { ComplianceReportPdfContent } from "./ComplianceReportPdfContent";
export type { ComplianceReportPdfContentProps } from "./ComplianceReportPdfContent";
