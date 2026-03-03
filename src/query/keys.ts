/**
 * Shared API Query Keys
 *
 * All TanStack Query key factories follow the "key factory pattern":
 *  - Top-level keys are stable array prefixes (for broad invalidation)
 *  - Parameterized keys include IDs/filters for targeted refetching
 *
 * Convention:
 *  - `all` → invalidates the entire domain
 *  - `lists` → invalidates all list variants
 *  - `list(params)` → one specific list
 *  - `details` → invalidates all detail variants
 *  - `detail(id)` → one specific record
 *
 * Usage:
 *  queryClient.invalidateQueries({ queryKey: auditKeys.all })
 *  queryClient.invalidateQueries({ queryKey: auditKeys.lists() })
 */

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
} as const;

// ─── MAKER ────────────────────────────────────────────────────────────────────
export const storeKeys = {
  all: ["stores"] as const,
  lists: () => [...storeKeys.all, "list"] as const,
  detail: (id: string) => [...storeKeys.all, "detail", id] as const,
} as const;

export const shelfKeys = {
  all: ["shelves"] as const,
  lists: () => [...shelfKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...shelfKeys.lists(), filters] as const,
  details: () => [...shelfKeys.all, "detail"] as const,
  detail: (id: string) => [...shelfKeys.details(), id] as const,
} as const;

export const auditKeys = {
  all: ["audits"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...auditKeys.lists(), filters] as const,
  details: () => [...auditKeys.all, "detail"] as const,
  detail: (id: string) => [...auditKeys.details(), id] as const,
} as const;

export const complianceReportKeys = {
  all: ["compliance-reports"] as const,
  detail: (auditId: string) =>
    [...complianceReportKeys.all, "detail", auditId] as const,
} as const;

export const adhocAnalysisKeys = {
  all: ["adhoc-analyses"] as const,
  lists: () => [...adhocAnalysisKeys.all, "list"] as const,
  list: (storeId?: string) => [...adhocAnalysisKeys.lists(), storeId] as const,
  detail: (id: string) => [...adhocAnalysisKeys.all, "detail", id] as const,
} as const;

export const planogramKeys = {
  all: ["planograms"] as const,
  lists: () => [...planogramKeys.all, "list"] as const,
  list: (storeId?: string) => [...planogramKeys.lists(), storeId] as const,
  detail: (id: string) => [...planogramKeys.all, "detail", id] as const,
  shelfPreview: (shelfId: string | null) =>
    [...planogramKeys.all, "shelf-preview", shelfId ?? "none"] as const,
  comparison: (shelfId: string) =>
    [...planogramKeys.all, "comparison", shelfId] as const,
} as const;

export const dashboardStatsKeys = {
  all: ["dashboard-stats"] as const,
  maker: () => [...dashboardStatsKeys.all, "maker"] as const,
  checker: (storeId: string) =>
    [...dashboardStatsKeys.all, "checker", storeId] as const,
} as const;

export const quickStatsKeys = {
  all: ["quick-stats"] as const,
  maker: () => [...quickStatsKeys.all, "maker"] as const,
} as const;

// ─── CHECKER ──────────────────────────────────────────────────────────────────
export const complianceOverviewKeys = {
  all: ["compliance-overview"] as const,
  detail: (storeId: string) =>
    [...complianceOverviewKeys.all, "detail", storeId] as const,
} as const;

export const pendingAuditKeys = {
  all: ["pending-audits"] as const,
  list: (storeId: string) =>
    [...pendingAuditKeys.all, "list", storeId] as const,
} as const;

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string, storeId?: string) =>
    [...notificationKeys.all, "list", userId, storeId] as const,
} as const;

export const violationKeys = {
  all: ["violations"] as const,
  byAudit: (auditId: string) =>
    [...violationKeys.all, "audit", auditId] as const,
} as const;

export const publishedAuditKeys = {
  all: ["published-audits"] as const,
  list: (storeId: string) =>
    [...publishedAuditKeys.all, "list", storeId] as const,
} as const;

export const ruleInfoKeys = {
  all: ["rule-info"] as const,
  detail: (storeId: string) =>
    [...ruleInfoKeys.all, "detail", storeId] as const,
} as const;

export const overrideActivityKeys = {
  all: ["override-activity"] as const,
  detail: (storeId: string) =>
    [...overrideActivityKeys.all, "detail", storeId] as const,
} as const;

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const reportKeys = {
  all: ["reports"] as const,
  detailed: (reportId: string) =>
    [...reportKeys.all, "detailed", reportId] as const,
  shelfLevel: () => [...reportKeys.all, "shelf-level"] as const,
  storeLevel: () => [...reportKeys.all, "store-level"] as const,
  adhoc: () => [...reportKeys.all, "adhoc"] as const,
} as const;

// ─── KNOWLEDGE CENTER ─────────────────────────────────────────────────────────
export const knowledgeCenterKeys = {
  all: ["knowledge-center"] as const,
  rules: () => [...knowledgeCenterKeys.all, "rules"] as const,
  rule: (id: string) => [...knowledgeCenterKeys.all, "rule", id] as const,
  ruleVersions: (ruleId: string) =>
    [...knowledgeCenterKeys.all, "rule-versions", ruleId] as const,
  documents: () => [...knowledgeCenterKeys.all, "documents"] as const,
} as const;
