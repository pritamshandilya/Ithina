/**
 * Feature-specific types for the Checker dashboard
 * 
 * These types are internal to the checker feature and not part of the core domain.
 */

import type { AuditMode } from "@/types/maker";

/**
 * Filter options for the audit review queue
 */
export type AuditQueueFilter =
  | "all"        // All pending audits
  | "critical"   // Compliance < 50%
  | "attention"  // Compliance 50-79%
  | "good"       // Compliance 80-100%
  | "planogram"  // Planogram Based mode only
  | "adhoc";     // Adhoc Analysis mode only

/**
 * Sort options for the audit review queue
 */
export type AuditQueueSort =
  | "compliance-asc"   // Lowest compliance first (default)
  | "compliance-desc"  // Highest compliance first
  | "time-asc"         // Oldest first
  | "time-desc"        // Newest first
  | "violations-desc"  // Most violations first
  | "violations-asc";  // Least violations first

/**
 * Audit queue filters and sorting state
 */
export interface AuditQueueFilters {
  /**
   * Current filter selection
   */
  filter: AuditQueueFilter;
  
  /**
   * Current sort order
   */
  sort: AuditQueueSort;
  
  /**
   * Search query for shelf ID or submitter name
   */
  search: string;
  
  /**
   * Filter by audit mode (optional)
   */
  mode?: AuditMode;
}

/**
 * Props for audit queue card component
 */
export interface AuditQueueCardProps {
  /**
   * The audit to display
   */
  audit: import("@/types/checker").CheckerAudit;
  
  /**
   * Click handler for reviewing the audit
   */
  onClick?: (auditId: string) => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Props for the compliance overview component
 */
export interface ComplianceOverviewProps {
  /**
   * Selected store ID for filtering
   */
  storeId: string;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Props for the audit review queue component
 */
export interface AuditReviewQueueProps {
  /**
   * Selected store ID for filtering
   */
  storeId: string;
  
  /**
   * Click handler when an audit card is clicked
   */
  onAuditClick?: (auditId: string) => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Props for the checker header component
 */
export interface CheckerHeaderProps {
  /**
   * Current selected store ID
   */
  selectedStoreId: string;
  
  /**
   * Callback when store is changed
   */
  onStoreChange: (storeId: string) => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Props for the notifications dropdown component
 */
export interface NotificationsDropdownProps {
  /**
   * Whether the dropdown is open
   */
  isOpen: boolean;
  
  /**
   * Toggle dropdown open/close
   */
  onToggle: () => void;
  
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Display view mode for audit queue
 */
export type QueueViewMode = "card" | "table";
