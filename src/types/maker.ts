/**
 * Core types for the Maker (Store Worker) domain
 */

/**
 * Audit status representing the lifecycle of a shelf audit
 */
export type AuditStatus =
  | "never-audited" // Shelf has never been audited
  | "draft" // Audit started but not submitted (in progress)
  | "pending" // Audit submitted, awaiting checker review
  | "approved" // Audit approved by checker
  | "returned"; // Audit rejected by checker, needs resubmission

/**
 * Audit mode selection for data capture
 */
export type AuditMode =
  | "planogram-based" // Compare shelf against planogram
  | "adhoc" // Upload image for AI analysis
  | "vision-edge" // @deprecated Legacy - use planogram-based
  | "assist-mode"; // @deprecated Legacy - use adhoc

/**
 * Represents a physical shelf in the store
 */
export interface Shelf {
  id: string;
  fixtureId?: string;
  shelf_id?: string;
  /**
   * Physical location codes (string by design).
   * Examples: `A2` for aisle, `01` for bay code (format is store-defined).
   */
  aisleCode?: string;
  bayCode?: string;
  /**
   * Legacy numeric fields kept for backwards compatibility with
   * mock data and older UI paths.
   */
  aisleNumber?: number;
  bayNumber?: number;
  shelfName: string;
  /** String identifier from backend (e.g. S1, SH-01) */
  shelfCode?: string;
  description?: string;
  status: AuditStatus;
  lastAuditDate?: Date;
  complianceScore?: number; // 0-100, only present if audited
  assignedTo?: string; // User ID of assigned worker
  elevation?: "Bottom" | "Middle" | "Top" | "Eye Level";
  notes?: string;
  /** Planogram ID when shelf is created from planogram visual builder */
  planogramId?: string;
  /** User's edited arrangement when shelf is from planogram */
  arrangement?: unknown;
  /** Zone of the store */
  zone?: string;
  /** Section within the zone */
  section?: string;
  /** Type of fixture (e.g., Gondola, Wall Shelving) */
  fixtureType?: string;
  /** Shelf/fixture width */
  width?: number;
  /** Shelf/fixture height */
  height?: number;
  /** Fixture depth */
  depth?: number;
  /** Unit for dimensions */
  dimensionUnit?: string;
  /** Dimensions of the fixture */
  dimensions?: string;
  /** Shelf creation timestamp from backend */
  createdAt?: Date;
  /** Shelf update timestamp from backend */
  updatedAt?: Date;
  /** Shelf vertical position from backend */
  verticalPosition?: number;
}

/**
 * Represents a shelf audit submission
 */
export interface Audit {
  id: string;
  shelfId: string;
  submittedBy: string; // User ID
  submittedAt?: Date; // Optional for drafts
  mode: AuditMode;
  status: AuditStatus;
  complianceScore?: number;
  rejectionReason?: string; // Present if status is 'returned'
  rejectedAt?: Date;
  rejectedBy?: string; // Checker user ID
  approvedAt?: Date;
  draftSavedAt?: Date; // Last save timestamp for drafts
  draftProgress?: number; // 0-100 percentage for draft completion
  approvedBy?: string; // Checker user ID
  /** When mode is adhoc: ID of the adhoc analysis for report navigation */
  adhocAnalysisId?: string;
}

/**
 * Status of an adhoc (one-off) AI analysis
 */
export type AdhocAnalysisStatus = "processing" | "completed" | "failed";

/**
 * Represents an adhoc analysis: upload shelf image, AI analyzes retail space
 */
export interface AdhocAnalysis {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  createdAt: Date;
  status: AdhocAnalysisStatus;
  complianceScore?: number; // 0-100 when completed
  errorMessage?: string; // When status is failed
  /** Shelf ID from capture context */
  shelfId?: string;
  /** Shelf name from capture context */
  shelfName?: string;
  /** Zone from capture context (e.g. Grocery, Dairy) */
  zone?: string;
  /** Section from capture context */
  section?: string;
  /** Fixture type (e.g. wall_shelving) */
  fixtureType?: string;
  /** Fixture dimensions W×H */
  dimensions?: string;
}

/**
 * Unified row for Historical Analysis table (adhoc + planogram runs)
 */
export interface HistoricalAnalysisRow {
  id: string;
  type: "adhoc" | "planogram";
  name: string;
  storeName: string;
  runDate: Date;
  status: AdhocAnalysisStatus | "completed";
  complianceScore?: number;
  storeId?: string;
  errorMessage?: string;
  shelfId?: string;
  shelfName?: string;
  planogramName?: string;
  imageUrl?: string;
}

/**
 * Quick statistics for the maker dashboard
 */
export interface QuickStats {
  auditsSubmittedToday: number;
  pendingReviewCount: number;
  returnedAuditsCount: number;
}

/**
 * Daily audit count for chart (last 7 days)
 */
export interface MakerDailyAuditCount {
  day: string;
  label: string;
  submitted: number;
  approved: number;
}

/**
 * Status breakdown for pie/donut chart
 */
export interface MakerStatusBreakdown {
  status: string;
  label: string;
  count: number;
  color: string;
}

/**
 * Maker dashboard performance stats (charts data)
 */
export interface MakerDashboardStats {
  weeklyAudits: MakerDailyAuditCount[];
  statusBreakdown: MakerStatusBreakdown[];
}

/**
 * Mock user context (will be replaced with real auth later)
 */
export interface MockUserContext {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "maker" | "checker";
  storeId: string;
  storeName: string;
}

/**
 * Planogram analysis view of a shelf (extends Shelf with planogram-specific display fields)
 */
export interface PlanogramShelfRow extends Shelf {
  /** Compliance rule set name applied to this shelf */
  complianceRuleSet?: string;
  /** Categorization mode (e.g. "By Category", "By Brand") */
  categorizeBy?: string;
  /** Last planogram analysis run date */
  lastRun?: Date;
  /** Product count from last analysis */
  productsCount?: number;
  /** Issue count from last analysis */
  issuesCount?: number;
  /** From planogram physicalLocation */
  zone?: string;
  /** From planogram physicalLocation */
  section?: string;
  /** Fixture type (e.g. wall_shelving) */
  fixtureType?: string;
  /** Fixture dimensions W×H×D */
  dimensions?: string;
}

/**
 * Sync status for offline mode
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: Date;
  pendingSyncCount?: number;
}
