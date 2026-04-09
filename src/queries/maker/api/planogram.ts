import { getAnalysisApiClient } from "@/queries/analysis";
import type {
  PlanogramArrangement,
  PlanogramPayload,
  PlanogramSummary,
} from "@/types/planogram";
import type { Shelf } from "@/types/maker";

/**
 * Get shelves created via planogram visual builder (for merging with assigned shelves)
 */
export function getCreatedPlanogramShelves(): Shelf[] {
  return getAnalysisApiClient().getCreatedPlanogramShelves();
}

/**
 * Fetch list of available planograms (from third party)
 *
 * @param _storeId - Optional store ID to filter (unused in mock)
 * @returns Promise<PlanogramSummary[]>
 */
export async function fetchPlanogramList(_storeId?: string): Promise<PlanogramSummary[]> {
  return getAnalysisApiClient().fetchPlanogramList(_storeId);
}

/**
 * Fetch full planogram by ID (from third party)
 *
 * @param id - Planogram ID (e.g. PLN-SHELF-POC-001)
 * @returns Promise<PlanogramPayload | null>
 */
export async function fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
  return getAnalysisApiClient().fetchPlanogramById(id);
}

/**
 * Save shelf arrangement – creates shelf linked to planogram with user's edits
 *
 * @param shelfName - Display name for the shelf
 * @param planogramId - Source planogram ID
 * @param arrangement - User's edited arrangement
 * @param storeId - Store to associate shelf with
 * @returns Promise<Shelf>
 */
export async function saveShelfArrangement(
  shelfName: string,
  planogramId: string,
  arrangement: PlanogramArrangement,
  _storeId: string
): Promise<Shelf> {
  return getAnalysisApiClient().saveShelfArrangement(
    shelfName,
    planogramId,
    arrangement,
    _storeId,
  );
}

/**
 * Assign a planogram to an existing shelf (for shelves created without a planogram).
 *
 * @param shelfId - Shelf to update
 * @param planogramId - Planogram to associate
 * @param arrangement - Arrangement from the planogram
 * @returns Promise<Shelf | null> - Updated shelf or null if not found
 */
export async function assignPlanogramToShelf(
  shelfId: string,
  planogramId: string,
  arrangement: PlanogramArrangement
): Promise<Shelf | null> {
  return getAnalysisApiClient().assignPlanogramToShelf(
    shelfId,
    planogramId,
    arrangement,
  );
}

export function getAssignPlanogramOverlays(): Map<string, { planogramId: string; arrangement: PlanogramArrangement }> {
  return getAnalysisApiClient().getAssignPlanogramOverlays();
}

/**
 * Update an existing shelf's arrangement (product order, removed items, product edits)
 *
 * @param shelfId - Shelf to update
 * @param arrangement - Updated arrangement
 * @returns Promise<Shelf | null> - Updated shelf or null if not found
 */
export async function updateShelfArrangement(
  shelfId: string,
  arrangement: PlanogramArrangement
): Promise<Shelf | null> {
  return getAnalysisApiClient().updateShelfArrangement(shelfId, arrangement);
}
