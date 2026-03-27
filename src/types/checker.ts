/**
 * Core types for the Checker (Store Manager) domain
 *
 * The Checker role focuses on governance, oversight, and configuration control.
 * These types extend the base Maker types with checker-specific fields and functionality.
 */
import type { Audit } from "./maker";

/**
 * Extended audit type with checker-specific fields
 */
export interface CheckerAudit extends Audit {
  /**
   * Number of rule violations found in the audit
   */
  violationCount: number;

  /**
   * Version of the rule set used during this audit
   */
  ruleVersionUsed: string;

  /**
   * Publishing status for event bus integration
   */
  publishingStatus?: PublishingStatus;

  /**
   * Name of the maker who submitted the audit
   */
  submittedByName: string;

  /**
   * Shelf information for display
   */
  shelfInfo: {
    aisleCode: string;
    bayCode: string;
    shelfName: string;
  };
}

/**
 * Publishing status for approved audits
 */
export type PublishingStatus =
  | "pending" // Awaiting publication
  | "published" // Successfully published to event bus
  | "failed"; // Publication failed, needs retry

/**
 * High-level compliance overview metrics for governance
 */
export interface ComplianceOverview {
  /**
   * Total number of audits awaiting checker review
   */
  totalPendingAudits: number;

  /**
   * Number of audits with compliance score below 50% (critical)
   */
  criticalAudits: number;

  /**
   * Average compliance score across all audits in last 7 days
   */
  avgComplianceScore: number;

  /**
   * Number of audits approved today
   */
  totalApprovedToday: number;

  /**
   * Number of AI decisions overridden today
   */
  totalOverridesToday: number;
}

/**
 * Daily compliance for chart (last 7 days)
 */
export interface CheckerDailyCompliance {
  day: string;
  label: string;
  avgScore: number;
  approved: number;
}

/**
 * Shelf status breakdown for store
 */
export interface CheckerShelfBreakdown {
  status: string;
  label: string;
  count: number;
  color: string;
}

/**
 * Checker dashboard stats for charts
 */
export interface CheckerDashboardStats {
  weeklyCompliance: CheckerDailyCompliance[];
  shelfBreakdown: CheckerShelfBreakdown[];
}

/**
 * Store information for multi-store management
 */
export interface Store {
  /**
   * Unique store identifier
   */
  id: string;

  /**
   * Store display name
   */
  name: string;

  /**
   * Store physical address
   */
  address: string;

  /**
   * Number of pending audits for this store
   */
  pendingAuditCount?: number;

  /**
   * Store region
   */
  region?: string;

  /**
   * When the store but added to system
   */
  created?: string;

  /**
   * List of maker IDs assigned to this store
   */
  maker_ids?: string[];

  /**
   * Optional generic list of assigned user IDs (maker/checker)
   */
  user_ids?: string[];

  /**
   * Store status
   */
  status?: "Active" | "Inactive";

  /**
   * Store currency
   */
  currency?: string;

  /**
   * Store dimension system
   */
  default_dimensions?: string;

  /**
   * Default compliance rule-set identifier for this store.
   */
  default_compliance_rule_set_id?: string | null;

  /**
   * Backend source of truth for active status.
   */
  is_active?: boolean;
}

/**
 * Store configuration shape used by checker store management screens.
 */
export interface StoreSetting extends Store {
  region: string;
  status: "Active" | "Inactive";
  currency: string;
  default_dimensions: string;
}

/**
 * Notification types for checker alerts
 */
export type NotificationType =
  | "new_audit" // New audit submitted
  | "critical_audit" // Critical audit needs immediate attention
  | "rule_change"; // Rule has been modified

/**
 * Notification for checker dashboard
 */
export interface Notification {
  /**
   * Unique notification identifier
   */
  id: string;

  /**
   * Type of notification
   */
  type: NotificationType;

  /**
   * Notification message text
   */
  message: string;

  /**
   * When the notification was created
   */
  timestamp: Date;

  /**
   * Whether the notification has been read
   */
  read: boolean;

  /**
   * Related audit ID (if applicable)
   */
  auditId?: string;

  /**
   * Related store ID
   */
  storeId?: string;
}

/**
 * Rule system information and metadata
 */
export interface RuleInfo {
  /**
   * Total number of active rules
   */
  activeRulesCount: number;

  /**
   * When the last rule was modified
   */
  lastModifiedDate: Date;

  /**
   * Current active rule version
   */
  currentVersion: string;

  /**
   * Name of the last modified rule
   */
  lastModifiedRuleName?: string;
}

/**
 * Override activity metrics for governance transparency
 */
export interface OverrideActivity {
  /**
   * Number of overrides performed today
   */
  overridesToday: number;

  /**
   * Number of overrides performed this week
   */
  overridesThisWeek: number;

  /**
   * Name of the rule that was overridden most frequently
   */
  topOverriddenRule: string;

  /**
   * Number of times the top rule was overridden
   */
  topOverriddenCount: number;
}

/**
 * Published audit information for event bus status
 */
export interface PublishedAudit {
  /**
   * Audit identifier
   */
  auditId: string;

  /**
   * Shelf identification
   */
  shelfInfo: {
    aisleCode: string;
    bayCode: string;
    shelfName: string;
  };

  /**
   * Publishing status
   */
  status: PublishingStatus;

  /**
   * When the audit was published (or attempted)
   */
  publishedAt: Date;

  /**
   * Error message if publishing failed
   */
  errorMessage?: string;
}

/**
 * Violation details for audit review
 */
export interface Violation {
  /**
   * Violation identifier
   */
  id: string;

  /**
   * Rule that was violated
   */
  ruleName: string;

  /**
   * Severity of the violation
   */
  severity: "critical" | "warning" | "info";

  /**
   * Description of the violation
   */
  description: string;

  /**
   * Expected value or state
   */
  expected: string;

  /**
   * Actual value or state found
   */
  actual: string;

  /**
   * Whether this violation was overridden by checker
   */
  overridden?: boolean;

  /**
   * Override reason if applicable
   */
  overrideReason?: string;
}

/**
 * Mock checker user context (extends base MockUserContext)
 */
export interface MockCheckerContext {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "checker";
  storeId: string;
  storeName: string;
  /**
   * List of store IDs this checker manages
   */
  assignedStoreIds: string[];
}

export type RuleType =
  | "Facings"
  | "Spacing"
  | "Product Position"
  | "Margin"
  | "OOS"
  | "Labeling"
  | "VISUAL"
  | "SAFETY"
  | "PROFITABILITY"
  | "EFFICIENCY";

export type RuleSeverity = "Low" | "Medium" | "High";

export type RuleStatus = "Draft" | "Active" | "Retired";

export type RuleVersionStatus = "Draft" | "Active" | "Archived" | "Retired";

export interface RuleVersion {
  id: string;
  ruleId: string;
  version: number;
  status: RuleVersionStatus;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverity;
  effectiveDate?: Date;
  createdDate: Date;
  createdBy: string;
  changeSummary?: string;
}

export interface ComplianceRule {
  ruleId: string;
  ruleName: string;
  ruleType: RuleType;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverity;
  status: RuleStatus;
  currentVersion: number;
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  versions: RuleVersion[];
  linkedDocumentIds: string[];
  /** Optional description from rule set UI */
  description?: string;
  /** Rule set grouping - rules with same ruleSetId belong to same set */
  ruleSetId?: string;
  ruleSetName?: string;
  /** When part of a rule set, whether this rule is enabled (for display) */
  enabled?: boolean;
}

export interface ReferenceDocument {
  id: string;
  name: string;
  uploadedDate: Date;
  uploadedBy: string;
  linkedRuleIds: string[];
}

export interface RuleValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RuleFilters {
  shelfType?: string;
  severity?: RuleSeverity;
  status?: RuleStatus;
}

export interface CreateRuleInput {
  ruleName: string;
  ruleType: RuleType;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverity;
  createdBy: string;
  /** Optional description from rule set UI */
  description?: string;
  /** Rule set grouping */
  ruleSetId?: string;
  ruleSetName?: string;
  enabled?: boolean;
}

export interface UpdateRuleInput {
  ruleName: string;
  ruleType: RuleType;
  shelfType: string;
  expectedValue: string;
  tolerance?: number;
  severity: RuleSeverity;
  updatedBy: string;
  changeSummary?: string;
}
