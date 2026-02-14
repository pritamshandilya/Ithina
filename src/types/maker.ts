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
  | "vision-edge" // AI-powered camera detection
  | "assist-mode"; // Manual structured entry

/**
 * Represents a physical shelf in the store
 */
export interface Shelf {
  id: string;
  aisleNumber: number;
  bayNumber: number;
  shelfName: string;
  description?: string;
  status: AuditStatus;
  lastAuditDate?: Date;
  complianceScore?: number; // 0-100, only present if audited
  assignedTo?: string; // User ID of assigned worker
  elevation?: "Bottom" | "Middle" | "Top" | "Eye Level";
  notes?: string;
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
 * Mock user context (will be replaced with real auth later)
 */
export interface MockUserContext {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "maker" | "checker";
  storeId: string;
  storeName: string;
}

/**
 * Sync status for offline mode
 */
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime?: Date;
  pendingSyncCount?: number;
}
