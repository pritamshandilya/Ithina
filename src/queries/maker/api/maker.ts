/**
 * API functions for the Maker (Store Worker) feature
 * Currently using mock data - these functions will be replaced with real API calls later
 */
import {
  getAssignPlanogramOverlays,
  getCreatedPlanogramShelves,
} from "@/queries/maker/api/planogram";
import {
  generateMakerDashboardStats,
  generateMockAudits,
  generateMockQuickStats,
  generateMockShelves,
  getDraftAudits,
  getReturnedAudits,
} from "@/lib/api/mock-data";
import { apiClient, ApiError } from "@/queries/shared";
import { getAnalysisApiClient } from "@/queries/analysis";
import { getShelf, mapShelfResponseToShelf } from "./shelves";
import type { Store } from "@/types/checker";
import type {
  AdhocAnalysis,
  Audit,
  MakerDashboardStats,
  QuickStats,
  Shelf,
} from "@/types/maker";

/**
 * Simulates network delay for realistic API behavior
 */
function simulateNetworkDelay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch list of stores assigned to the maker (a maker can belong to more than one store)
 *
 * @param _userId - The maker's user ID (currently handled by Bearer token)
 * @returns Promise<Store[]> - Array of store objects
 */
export async function fetchStores(userId: string): Promise<Store[]> {
  void userId;
  return apiClient.get<Store[]>("/stores");
}

/** In-memory store for shelves created via createShelf (wireframe; replace with API in production) */
const createdShelves: Shelf[] = [];

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

  const mockShelves = generateMockShelves();
  const planogramShelves = getCreatedPlanogramShelves();
  const all = [...mockShelves, ...planogramShelves, ...createdShelves];
  const overlays = getAssignPlanogramOverlays();
  if (overlays.size === 0) return all;
  return all.map((s) => {
    const overlay = overlays.get(s.id);
    if (!overlay) return s;
    return {
      ...s,
      planogramId: overlay.planogramId,
      arrangement: overlay.arrangement,
    };
  });
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
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}): Promise<Shelf> {
  await simulateNetworkDelay(600);

  // In production, this would be:
  // const response = await api.post('/maker/shelves', shelfData);
  // return response.data;

  const shelf: Shelf = {
    id: `shelf-new-${Date.now()}`,
    ...shelfData,
    status: "never-audited",
    assignedTo: "user-001",
  };
  createdShelves.push(shelf);
  return shelf;
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
export async function fetchQuickStats(storeId?: string): Promise<QuickStats> {
  await simulateNetworkDelay(200);

  // In production, this would be:
  // const response = await api.get('/maker/stats');
  // return response.data;

  return generateMockQuickStats(storeId);
}

/**
 * Fetch maker dashboard stats (weekly audits, status breakdown) for charts
 */
export async function fetchMakerDashboardStats(
  storeId?: string,
): Promise<MakerDashboardStats> {
  await simulateNetworkDelay(200);
  return generateMakerDashboardStats(storeId);
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
export async function fetchReturnedAudits(storeId?: string): Promise<Audit[]> {
  await simulateNetworkDelay(250);

  // In production, this would be:
  // const response = await api.get('/maker/audits/returned');
  // return response.data;

  return getReturnedAudits(storeId);
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
export async function fetchAudits(storeId?: string): Promise<Audit[]> {
  await simulateNetworkDelay(300);

  // In production, this would be:
  // const response = await api.get('/maker/audits');
  // return response.data;

  return generateMockAudits(storeId);
}

/**
 * Fetch a single shelf by ID using the real API
 *
 * @param shelfId - The unique identifier of the shelf
 * @returns Promise<Shelf | null> - Shelf object or null if not found
 */
export async function fetchShelfById(shelfId: string): Promise<Shelf | null> {
  try {
    const res = await getShelf(shelfId);
    return mapShelfResponseToShelf(res);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Get shelf by ID from all sources.
 * Prefers real API, falls back to planogram-created shelves if needed.
 */
export async function getShelfById(shelfId: string): Promise<Shelf | null> {
  const shelf = await fetchShelfById(shelfId);
  if (shelf) return shelf;

  // Fallback to planogram-created in-memory shelves for visual builder previews
  const planogramShelves = getCreatedPlanogramShelves();
  const found = planogramShelves.find((s) => s.id === shelfId) ?? null;
  return found;
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
export async function fetchDraftAudits(storeId?: string): Promise<Audit[]> {
  await simulateNetworkDelay(400);

  // In production, this would be:
  // const response = await api.get('/maker/audits/drafts');
  // return response.data;

  return getDraftAudits(storeId);
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
export async function saveDraftProgress(
  auditId: string,
  progress: number,
): Promise<Audit> {
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
  void auditId;
  await simulateNetworkDelay(300);

  // In production, this would be:
  // await api.delete(`/maker/audits/${auditId}/draft`);
}

/**
 * Fetch adhoc analyses for the maker (one-off shelf image uploads + AI analysis)
 *
 * @param storeId - Optional store ID to filter by
 * @returns Promise<AdhocAnalysis[]> - Array of adhoc analysis records
 */
export async function fetchAdhocAnalyses(
  storeId?: string,
): Promise<AdhocAnalysis[]> {
  const analysisApiClient = getAnalysisApiClient();
  return analysisApiClient.fetchAdhocAnalyses({ storeId });
}
