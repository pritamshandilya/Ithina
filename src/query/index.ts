/**
 * Query Layer – Barrel Export
 *
 * Exports the shared QueryClient instance and all query key factories.
 *
 * Usage:
 *   import { queryClient } from "@/query";
 *   import { auditKeys, shelfKeys } from "@/query";
 */

export { queryClient } from "./client";
export { apiClient, ApiError } from "./api-client";
export type * from "./keys";
export {
  authKeys,
  storeKeys,
  shelfKeys,
  auditKeys,
  complianceReportKeys,
  adhocAnalysisKeys,
  planogramKeys,
  dashboardStatsKeys,
  quickStatsKeys,
  complianceOverviewKeys,
  pendingAuditKeys,
  notificationKeys,
  violationKeys,
  publishedAuditKeys,
  ruleInfoKeys,
  overrideActivityKeys,
  reportKeys,
  knowledgeCenterKeys,
} from "./keys";
