/**
 * API functions for the Maker (Store Worker) feature
 * Currently using mock data - these functions will be replaced with real API calls later
 */

import {
  generateMockAudits,
  generateMockQuickStats,
  generateMockShelves,
  generateMockStores,
  getReturnedAudits,
  getDraftAudits,
} from "@/lib/api/mock-data";
import type { Audit, QuickStats, Shelf } from "@/types/maker";
import type { Store } from "@/types/checker";

/**
 * Simulates network delay for realistic API behavior
 */
function simulateNetworkDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch list of stores assigned to the maker (a maker can belong to more than one store)
 *
 * @param userId - The maker's user ID
 * @returns Promise<Store[]> - Array of store objects
 */
export async function fetchStores(_userId: string): Promise<Store[]> {
  await simulateNetworkDelay(300);
  return generateMockStores();
}

/**
 * Fetch all assigned shelves for the current user
 * 
 * @returns Promise<Shelf[]> - Array of shelf objects
 * 
 * @example
 * ```ts
 * const shelves = await fetchAssignedShelves();
 * ```
 */
export async function fetchAssignedShelves(): Promise<Shelf[]> {
  await simulateNetworkDelay(300);
  
  // In production, this would be:
  // const response = await api.get('/maker/shelves');
  // return response.data;
  
  return generateMockShelves();
}

/**
 * Create a new shelf with metadata
 *
 * @param shelfData - Metadata for the new shelf (aisle, bay, name, description)
 * @returns Promise<Shelf> - The created shelf object
 *
 * @example
 * ```ts
 * const newShelf = await createShelf({
 *   aisleNumber: 1,
 *   bayNumber: 2,
 *   shelfName: 'New Shelf',
 *   description: 'Description'
 * });
 * ```
 */
export async function createShelf(shelfData: {
  aisleNumber: number;
  bayNumber: number;
  shelfName: string;
  description?: string;
}): Promise<Shelf> {
  await simulateNetworkDelay(600);

  // In production, this would be:
  // const response = await api.post('/maker/shelves', shelfData);
  // return response.data;

  // Mock response
  return {
    id: `shelf-new-${Date.now()}`,
    ...shelfData,
    status: "never-audited",
    assignedTo: "user-001",
  };
}

/**
 * Fetch quick statistics for the dashboard
 * 
 * @returns Promise<QuickStats> - Statistics object
 * 
 * @example
 * ```ts
 * const stats = await fetchQuickStats();
 * console.log(stats.auditsSubmittedToday); // 5
 * ```
 */
export async function fetchQuickStats(): Promise<QuickStats> {
  await simulateNetworkDelay(200);
  
  // In production, this would be:
  // const response = await api.get('/maker/stats');
  // return response.data;
  
  return generateMockQuickStats();
}

/**
 * Fetch returned audits that need resubmission
 * 
 * @returns Promise<Audit[]> - Array of returned audit objects
 * 
 * @example
 * ```ts
 * const returned = await fetchReturnedAudits();
 * returned.forEach(audit => console.log(audit.rejectionReason));
 * ```
 */
export async function fetchReturnedAudits(): Promise<Audit[]> {
  await simulateNetworkDelay(250);
  
  // In production, this would be:
  // const response = await api.get('/maker/audits/returned');
  // return response.data;
  
  return getReturnedAudits();
}

/**
 * Fetch all audits for the current user
 * 
 * @returns Promise<Audit[]> - Array of all audit objects
 * 
 * @example
 * ```ts
 * const audits = await fetchAudits();
 * ```
 */
export async function fetchAudits(): Promise<Audit[]> {
  await simulateNetworkDelay(300);
  
  // In production, this would be:
  // const response = await api.get('/maker/audits');
  // return response.data;
  
  return generateMockAudits();
}

/**
 * Fetch a single shelf by ID
 * 
 * @param shelfId - The unique identifier of the shelf
 * @returns Promise<Shelf | null> - Shelf object or null if not found
 * 
 * @example
 * ```ts
 * const shelf = await fetchShelfById('shelf-001');
 * ```
 */
export async function fetchShelfById(shelfId: string): Promise<Shelf | null> {
  await simulateNetworkDelay(200);
  
  // In production, this would be:
  // const response = await api.get(`/maker/shelves/${shelfId}`);
  // return response.data;
  
  const shelves = generateMockShelves();
  return shelves.find((shelf) => shelf.id === shelfId) || null;
}

/**
 * Submit a new audit (placeholder for future implementation)
 * 
 * @param auditData - The audit data to submit
 * @returns Promise<Audit> - The created audit object
 * 
 * @example
 * ```ts
 * const newAudit = await submitAudit({
 *   shelfId: 'shelf-001',
 *   mode: 'vision-edge',
 *   // ... other audit data
 * });
 * ```
 */
export async function submitAudit(auditData: {
  shelfId: string;
  mode: "vision-edge" | "assist-mode";
  complianceScore: number;
}): Promise<Audit> {
  await simulateNetworkDelay(1000);
  
  // In production, this would be:
  // const response = await api.post('/maker/audits', auditData);
  // return response.data;
  
  // Mock response
  return {
    id: `audit-new-${Date.now()}`,
    shelfId: auditData.shelfId,
    submittedBy: "user-001",
    submittedAt: new Date(),
    mode: auditData.mode,
    status: "pending",
    complianceScore: auditData.complianceScore,
  };
}

/**
 * Resubmit a returned audit (placeholder for future implementation)
 * 
 * @param auditId - The audit ID to resubmit
 * @returns Promise<Audit> - The updated audit object
 * 
 * @example
 * ```ts
 * const resubmitted = await resubmitAudit('audit-123');
 * ```
 */
export async function resubmitAudit(auditId: string): Promise<Audit> {
  await simulateNetworkDelay(800);
  
  // In production, this would be:
  // const response = await api.put(`/maker/audits/${auditId}/resubmit`);
  // return response.data;
  
  // Mock response - find the audit and update its status
  const audits = generateMockAudits();
  const audit = audits.find((a) => a.id === auditId);
  
  if (!audit) {
    throw new Error("Audit not found");
  }
  
  return {
    ...audit,
    status: "pending",
    submittedAt: new Date(),
    rejectionReason: undefined,
    rejectedAt: undefined,
    rejectedBy: undefined,
  };
}

/**
 * Fetch all draft audits for the current user
 * 
 * @returns Promise<Audit[]> - Array of draft audits
 * 
 * @example
 * ```ts
 * const drafts = await fetchDraftAudits();
 * ```
 */
export async function fetchDraftAudits(): Promise<Audit[]> {
  await simulateNetworkDelay(400);
  
  // In production, this would be:
  // const response = await api.get('/maker/audits/drafts');
  // return response.data;
  
  return getDraftAudits();
}

/**
 * Save draft audit progress
 * 
 * @param auditId - The audit ID to save
 * @param progress - Progress percentage (0-100)
 * @returns Promise<Audit> - Updated audit object
 * 
 * @example
 * ```ts
 * const saved = await saveDraftProgress('audit-123', 65);
 * ```
 */
export async function saveDraftProgress(auditId: string, progress: number): Promise<Audit> {
  await simulateNetworkDelay(300);
  
  // In production, this would be:
  // const response = await api.put(`/maker/audits/${auditId}/draft`, { progress });
  // return response.data;
  
  const audits = generateMockAudits();
  const audit = audits.find((a) => a.id === auditId);
  
  if (!audit) {
    throw new Error("Draft audit not found");
  }
  
  return {
    ...audit,
    draftProgress: progress,
    draftSavedAt: new Date(),
  };
}

/**
 * Delete a draft audit
 * 
 * @param auditId - The audit ID to delete
 * @returns Promise<void>
 * 
 * @example
 * ```ts
 * await deleteDraft('audit-123');
 * ```
 */
export async function deleteDraft(auditId: string): Promise<void> {
  await simulateNetworkDelay(300);
  
  // In production, this would be:
  // await api.delete(`/maker/audits/${auditId}/draft`);
}
