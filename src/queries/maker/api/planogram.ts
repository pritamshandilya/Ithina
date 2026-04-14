import type {
  CreatePlanogramPayload,
  PlanogramApiStatus,
  UpdatePlanogramPayload,
} from "@/models/request/planograms";
import type { PlanogramResponse } from "@/models/response/planograms";
import { mockAnalysisApiClient } from "@/queries/analysis/providers/mock-analysis-api";
import { apiClient, ApiError } from "@/queries/shared";
import type {
  PlanogramArrangement,
  PlanogramPayload,
  PlanogramSummary,
} from "@/types/planogram";
import type { Shelf } from "@/types/maker";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function normalizePlanogramStatus(rawStatus: string | undefined): PlanogramApiStatus {
  const normalized = (rawStatus ?? "").toUpperCase();
  if (normalized === "ACTIVE" || normalized === "ARCHIVED") {
    return normalized;
  }
  return "DRAFT";
}

function toPlanogramPayload(response: PlanogramResponse): PlanogramPayload {
  const raw = response.planogram_data;
  if (raw && typeof raw === "object" && "planogram" in raw) {
    return raw as unknown as PlanogramPayload;
  }

  return {
    planogram: {
      id: response.id,
      name: response.name,
      version: response.version ?? "1.0",
      createdDate: response.created_at,
      location: response.description ?? "—",
      status: response.status,
      physicalLocation: {
        storeId: response.store_id,
        zone: "—",
        aisle: "—",
        bay: "—",
        side: "—",
        section: "—",
        fixtureIndexInBay: 0,
      },
      fixture: {
        fixtureId: "",
        type: "unknown",
        width: 0,
        height: 0,
        depth: 0,
        shelves: [],
      },
    },
    metadata: undefined,
    stockingRules: undefined,
  };
}

function toPlanogramSummary(response: PlanogramResponse): PlanogramSummary {
  const payload = toPlanogramPayload(response);
  const fixture = payload.planogram.fixture;
  const location = payload.planogram.physicalLocation;
  const productCount = fixture.shelves.reduce(
    (sum, shelf) => sum + shelf.products.length,
    0,
  );

  return {
    id: response.id,
    name: response.name,
    shelfCount: fixture.shelves.length,
    productCount,
    dimensions:
      fixture.width || fixture.height || fixture.depth
        ? `${fixture.width}×${fixture.height}×${fixture.depth}`
        : undefined,
    location: response.description ?? payload.planogram.location,
    zone: location?.zone,
    aisle: location?.aisle,
    bay: location?.bay,
    section: location?.section,
    fixtureType: fixture.type,
    fixtureId: fixture.fixtureId,
    width: fixture.width,
    height: fixture.height,
    depth: fixture.depth,
  };
}

function toCreatePayload(payload: PlanogramPayload): CreatePlanogramPayload {
  return {
    name: payload.planogram.name,
    version: payload.planogram.version,
    description: payload.planogram.location,
    status: normalizePlanogramStatus(payload.planogram.status),
    planogram_data: payload as unknown as Record<string, unknown>,
  };
}

function toUpdatePayload(payload: PlanogramPayload): UpdatePlanogramPayload {
  return {
    name: payload.planogram.name,
    version: payload.planogram.version,
    description: payload.planogram.location,
    status: normalizePlanogramStatus(payload.planogram.status),
    planogram_data: payload as unknown as Record<string, unknown>,
  };
}

export function getCreatedPlanogramShelves(): Shelf[] {
  return mockAnalysisApiClient.getCreatedPlanogramShelves();
}

export async function fetchPlanogramList(status?: PlanogramApiStatus): Promise<PlanogramSummary[]> {
  const response = await apiClient.get<PlanogramResponse[]>("/planograms", status ? { status } : undefined);
  return response.map(toPlanogramSummary);
}

export async function fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
  if (!isUuid(id)) {
    return null;
  }

  try {
    const response = await apiClient.get<PlanogramResponse>(`/planograms/${id}`);
    return toPlanogramPayload(response);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
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
  return mockAnalysisApiClient.saveShelfArrangement(
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
  return mockAnalysisApiClient.assignPlanogramToShelf(
    shelfId,
    planogramId,
    arrangement,
  );
}

export function getAssignPlanogramOverlays(): Map<string, { planogramId: string; arrangement: PlanogramArrangement }> {
  return mockAnalysisApiClient.getAssignPlanogramOverlays();
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
  return mockAnalysisApiClient.updateShelfArrangement(shelfId, arrangement);
}

export async function createPlanogram(payload: PlanogramPayload): Promise<PlanogramPayload> {
  const response = await apiClient.post<PlanogramResponse>(
    "/planograms",
    toCreatePayload(payload),
  );
  return toPlanogramPayload(response);
}

export async function updatePlanogram(id: string, payload: PlanogramPayload): Promise<PlanogramPayload> {
  if (!isUuid(id)) {
    throw new Error("Invalid planogram id. Expected UUID.");
  }

  const response = await apiClient.put<PlanogramResponse>(
    `/planograms/${id}`,
    toUpdatePayload(payload),
  );
  return toPlanogramPayload(response);
}

export async function deletePlanogram(id: string): Promise<boolean> {
  if (!isUuid(id)) {
    return false;
  }

  try {
    await apiClient.delete<void>(`/planograms/${id}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return false;
    }
    throw error;
  }
}
