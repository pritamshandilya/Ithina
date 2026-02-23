/**
 * Planogram API – fetch planograms from third party (mocked)
 * In production, replace with real third-party API calls
 */

import { PLANOGRAM_POC_001, PLANOGRAM_POC_002 } from "@/lib/api/planogram-sample";
import type { PlanogramArrangement, PlanogramPayload, PlanogramSummary } from "@/types/planogram";
import type { Shelf } from "@/types/maker";

const PLANOGRAMS: PlanogramPayload[] = [PLANOGRAM_POC_001, PLANOGRAM_POC_002];

/** In-memory store for planogram-created shelves (wireframe; replace with API in production) */
const createdPlanogramShelves: Shelf[] = [];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get shelves created via planogram visual builder (for merging with assigned shelves)
 */
export function getCreatedPlanogramShelves(): Shelf[] {
  return [...createdPlanogramShelves];
}

/**
 * Fetch list of available planograms (from third party)
 *
 * @param _storeId - Optional store ID to filter (unused in mock)
 * @returns Promise<PlanogramSummary[]>
 */
export async function fetchPlanogramList(_storeId?: string): Promise<PlanogramSummary[]> {
  await delay(300);

  return PLANOGRAMS.map((p) => {
    const { planogram, metadata } = p;
    const fixture = planogram.fixture;
    const loc = planogram.physicalLocation;
    const productCount =
      metadata?.totalSKUs ??
      fixture.shelves.reduce((sum, s) => sum + s.products.length, 0);
    return {
      id: planogram.id,
      name: planogram.name,
      shelfCount: fixture.shelves.length,
      productCount,
      dimensions: `${fixture.width}×${fixture.height} ${planogram.storeConfig?.units ?? "mm"}`,
      location: planogram.location ?? metadata?.location,
      zone: loc?.zone,
      aisle: loc?.aisle,
      bay: loc?.bay,
      section: loc?.section,
      fixtureType: fixture.type,
      fixtureId: fixture.fixtureId,
      width: fixture.width,
      height: fixture.height,
      depth: fixture.depth,
    };
  });
}

/**
 * Fetch full planogram by ID (from third party)
 *
 * @param id - Planogram ID (e.g. PLN-SHELF-POC-001)
 * @returns Promise<PlanogramPayload | null>
 */
export async function fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
  await delay(200);

  const found = PLANOGRAMS.find((p) => p.planogram.id === id);
  return found ?? null;
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
  await delay(500);

  const shelf: Shelf = {
    id: `shelf-planogram-${Date.now()}`,
    aisleNumber: 1,
    bayNumber: 1,
    shelfName,
    description: `Planogram: ${planogramId}`,
    status: "never-audited",
    assignedTo: "user-001",
    planogramId,
    arrangement,
  };

  createdPlanogramShelves.push(shelf);
  return shelf;
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
  await delay(400);

  const idx = createdPlanogramShelves.findIndex((s) => s.id === shelfId);
  if (idx < 0) return null;

  createdPlanogramShelves[idx] = {
    ...createdPlanogramShelves[idx],
    arrangement,
  };
  return createdPlanogramShelves[idx];
}
