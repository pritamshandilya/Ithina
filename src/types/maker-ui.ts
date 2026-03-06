/**
 * Feature-specific types for Maker domain
 * These types are internal to the maker feature and not shared globally
 */

import type { AuditStatus } from "@/types/maker";

/**
 * Filter options for the assigned shelves list
 */
export type ShelfFilterOption = "all" | AuditStatus;

/**
 * Sort options for shelves
 */
export type ShelfSortOption =
  | "aisle-asc" // Aisle number ascending
  | "aisle-desc" // Aisle number descending
  | "status" // Group by status
  | "last-audit"; // Most recently audited first

/**
 * Filter state for the shelves list
 */
export interface ShelfFilters {
  status: ShelfFilterOption;
  sort: ShelfSortOption;
  searchQuery?: string;
}

/**
 * Props for components using shelf data
 */
export interface ShelfCardProps {
  shelf: import("@/types/maker").Shelf;
  onClick?: (shelfId: string) => void;
  showActions?: boolean;
}

/**
 * Props for audit-related components
 */
export interface AuditActionProps {
  auditId: string;
  shelfId: string;
  onComplete?: () => void;
}
