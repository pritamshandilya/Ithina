/**
 * Checker API Functions
 * 
 * Mock API layer for checker-specific data fetching.
 * These functions will be replaced with real API calls in production.
 * 
 * All functions include simulated network delay for realistic testing.
 */

import {
  generateCheckerDashboardStats,
  generateMockStores,
  generateMockComplianceOverview,
  generateMockPendingAudits,
  generateMockNotifications,
  generateMockRuleInfo,
  generateMockOverrideActivity,
  generateMockPublishedAudits,
  generateMockViolations,
} from "@/lib/api/mock-data";
import type {
  CheckerAudit,
  CheckerDashboardStats,
  ComplianceOverview,
  Notification,
  OverrideActivity,
  PublishedAudit,
  RuleInfo,
  Store,
  Violation,
} from "@/types/checker";

/**
 * Simulate network delay
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch list of stores assigned to the checker
 * 
 * @param userId - The checker's user ID
 * @returns Promise resolving to array of stores
 */
export async function fetchStores(_userId: string): Promise<Store[]> {
  await delay(300);
  return generateMockStores();
}

/**
 * Fetch compliance overview metrics for a specific store
 * 
 * @param storeId - The store ID to fetch metrics for
 * @returns Promise resolving to compliance overview data
 */
export async function fetchComplianceOverview(storeId: string): Promise<ComplianceOverview> {
  await delay(400);
  return generateMockComplianceOverview(storeId);
}

/**
 * Fetch checker dashboard stats for charts
 */
export async function fetchCheckerDashboardStats(
  storeId: string
): Promise<CheckerDashboardStats> {
  await delay(200);
  return generateCheckerDashboardStats(storeId);
}

/**
 * Fetch pending audits for review
 * 
 * @param storeId - The store ID to fetch audits for
 * @returns Promise resolving to array of pending audits
 */
export async function fetchPendingAudits(storeId: string): Promise<CheckerAudit[]> {
  await delay(500);
  return generateMockPendingAudits(storeId);
}

/**
 * Fetch notifications for the checker
 * 
 * @param userId - The checker's user ID
 * @param storeId - Optional store ID to filter notifications
 * @returns Promise resolving to array of notifications
 */
export async function fetchNotifications(
  _userId: string,
  storeId?: string
): Promise<Notification[]> {
  await delay(300);
  return generateMockNotifications(storeId || "store-1234");
}

/**
 * Mark a notification as read
 * 
 * @param notificationId - The notification ID to mark as read
 * @returns Promise resolving when operation completes
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await delay(200);
  // In real app, would make API call to update notification status
  console.log("Marked notification as read:", notificationId);
}

/**
 * Mark all notifications as read
 * 
 * @param userId - The checker's user ID
 * @returns Promise resolving when operation completes
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await delay(300);
  // In real app, would make API call to mark all as read
  console.log("Marked all notifications as read for user:", userId);
}

/**
 * Fetch rule information and metadata
 * 
 * @param storeId - The store ID to fetch rule info for
 * @returns Promise resolving to rule information
 */
export async function fetchRuleInfo(storeId: string): Promise<RuleInfo> {
  await delay(400);
  return generateMockRuleInfo(storeId);
}

/**
 * Fetch override activity metrics
 * 
 * @param storeId - The store ID to fetch override data for
 * @returns Promise resolving to override activity data
 */
export async function fetchOverrideActivity(storeId: string): Promise<OverrideActivity> {
  await delay(350);
  return generateMockOverrideActivity(storeId);
}

/**
 * Fetch recently published audits with event bus status
 * 
 * @param storeId - The store ID to fetch published audits for
 * @returns Promise resolving to array of published audits
 */
export async function fetchPublishedAudits(storeId: string): Promise<PublishedAudit[]> {
  await delay(400);
  return generateMockPublishedAudits(storeId);
}

/**
 * Approve an audit and publish to event bus
 * 
 * @param auditId - The audit ID to approve
 * @returns Promise resolving when operation completes
 */
export async function approveAudit(auditId: string): Promise<void> {
  await delay(600);
  // In real app, would make API call to approve and publish
  console.log("Approved audit:", auditId);
}

/**
 * Return an audit to the maker with rejection reason
 * 
 * @param auditId - The audit ID to return
 * @param reason - The rejection reason
 * @returns Promise resolving when operation completes
 */
export async function returnAudit(auditId: string, reason: string): Promise<void> {
  await delay(500);
  // In real app, would make API call to return audit
  console.log("Returned audit:", auditId, "Reason:", reason);
}

/**
 * Override AI decision and approve audit
 * 
 * @param auditId - The audit ID to override and approve
 * @param overrideReason - The reason for override
 * @returns Promise resolving when operation completes
 */
export async function overrideAndApprove(
  auditId: string,
  overrideReason: string
): Promise<void> {
  await delay(600);
  // In real app, would make API call to override and approve
  console.log("Overridden and approved audit:", auditId, "Reason:", overrideReason);
}

/**
 * Fetch a single audit by ID with detailed information
 * 
 * @param auditId - The audit ID to fetch
 * @returns Promise resolving to audit details
 */
export async function fetchAuditById(auditId: string): Promise<CheckerAudit | null> {
  await delay(400);
  
  // Get all pending audits and find the one matching the ID
  const allAudits = generateMockPendingAudits("store-1234");
  const audit = allAudits.find((a) => a.id === auditId);
  
  return audit || null;
}

/**
 * Fetch violations for a specific audit
 * 
 * @param auditId - The audit ID to fetch violations for
 * @returns Promise resolving to array of violations
 */
export async function fetchAuditViolations(auditId: string): Promise<Violation[]> {
  await delay(400);
  
  // Get the audit first
  const audit = await fetchAuditById(auditId);
  if (!audit) return [];
  
  // Generate violations based on the audit
  return generateMockViolations(audit);
}
