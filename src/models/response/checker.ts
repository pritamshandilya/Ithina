/**
 * API Response Types – Checker
 *
 * Shapes returned by checker-specific governance endpoints.
 */

// ─── Checker Audit ────────────────────────────────────────────────────────────

export type PublishingStatusResponse = "pending" | "published" | "failed";

export interface CheckerAuditResponse {
  id: string;
  shelfId: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt?: string; // ISO date string
  mode: string;
  status: string;
  complianceScore?: number;
  rejectionReason?: string;
  rejectedAt?: string; // ISO date string
  rejectedBy?: string;
  approvedAt?: string; // ISO date string
  approvedBy?: string;
  draftSavedAt?: string; // ISO date string
  draftProgress?: number;
  violationCount: number;
  ruleVersionUsed: string;
  publishingStatus?: PublishingStatusResponse;
  shelfInfo: {
    aisleCode: string;
    bayCode: string;
    shelfName: string;
  };
}

export interface CheckerAuditListResponse {
  audits: CheckerAuditResponse[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Compliance Overview ──────────────────────────────────────────────────────

export interface ComplianceOverviewResponse {
  totalPendingAudits: number;
  criticalAudits: number;
  avgComplianceScore: number;
  totalApprovedToday: number;
  totalOverridesToday: number;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DailyComplianceResponse {
  day: string;
  label: string;
  avgScore: number;
  approved: number;
}

export interface ShelfBreakdownResponse {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface CheckerDashboardStatsResponse {
  weeklyCompliance: DailyComplianceResponse[];
  shelfBreakdown: ShelfBreakdownResponse[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationTypeResponse =
  | "new_audit"
  | "critical_audit"
  | "rule_change";

export interface NotificationResponse {
  id: string;
  type: NotificationTypeResponse;
  message: string;
  timestamp: string; // ISO date string
  read: boolean;
  auditId?: string;
  storeId?: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
}

// ─── Violations ───────────────────────────────────────────────────────────────

export interface ViolationResponse {
  id: string;
  ruleName: string;
  severity: "critical" | "warning" | "info";
  description: string;
  expected: string;
  actual: string;
  overridden?: boolean;
  overrideReason?: string;
}

export interface ViolationListResponse {
  violations: ViolationResponse[];
  total: number;
}

// ─── Rule Info ────────────────────────────────────────────────────────────────

export interface RuleInfoResponse {
  activeRulesCount: number;
  lastModifiedDate: string; // ISO date string
  currentVersion: string;
  lastModifiedRuleName?: string;
}

// ─── Override Activity ────────────────────────────────────────────────────────

export interface OverrideActivityResponse {
  overridesToday: number;
  overridesThisWeek: number;
  topOverriddenRule: string;
  topOverriddenCount: number;
}

// ─── Published Audits ─────────────────────────────────────────────────────────

export interface PublishedAuditResponse {
  auditId: string;
  shelfInfo: {
    aisleCode: string;
    bayCode: string;
    shelfName: string;
  };
  status: PublishingStatusResponse;
  publishedAt: string; // ISO date string
  errorMessage?: string;
}

export interface PublishedAuditListResponse {
  audits: PublishedAuditResponse[];
  total: number;
}

// ─── Audit Actions ────────────────────────────────────────────────────────────

export interface AuditActionResponse {
  success: boolean;
  message?: string;
}
