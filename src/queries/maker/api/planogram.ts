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

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isPlanogramPayload(value: unknown): value is PlanogramPayload {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.status === "string" &&
    isRecord(value.fixture) &&
    Array.isArray(value.shelves)
  );
}

function getPlanogramResponseId(response: PlanogramResponse): string {
  if ("id" in response && typeof response.id === "string" && response.id.trim()) {
    return response.id;
  }

  const payload = toPlanogramPayload(response);
  return `${payload.name}:${payload.version ?? "unversioned"}`;
}

function toPlanogramPayload(response: PlanogramResponse): PlanogramPayload {
  if (isPlanogramPayload(response)) {
    return response;
  }

  if (isPlanogramPayload(response.planogram_data)) {
    return response.planogram_data;
  }

  throw new Error("Invalid planogram response payload.");
}

function toPlanogramSummary(response: PlanogramResponse): PlanogramSummary {
  const payload = toPlanogramPayload(response);
  const productCount = payload.shelves.reduce(
    (sum, shelf) => sum + shelf.products.length,
    0,
  );

  return {
    id: getPlanogramResponseId(response),
    name: ("name" in response && typeof response.name === "string" ? response.name : null) ?? payload.name,
    version: ("version" in response ? response.version : undefined) ?? payload.version,
    description:
      ("description" in response && typeof response.description === "string"
        ? response.description
        : null) ?? payload.description,
    status: ("status" in response && typeof response.status === "string" ? response.status : null) ?? payload.status,
    shelfCount: payload.shelves.length,
    productCount,
    dimensions: `${payload.fixture.width}×${payload.fixture.height}×${payload.fixture.depth}`,
    width: payload.fixture.width,
    height: payload.fixture.height,
    depth: payload.fixture.depth,
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

export async function saveShelfArrangement(
  shelfName: string,
  planogramId: string,
  arrangement: PlanogramArrangement,
  storeId: string,
): Promise<Shelf> {
  return mockAnalysisApiClient.saveShelfArrangement(
    shelfName,
    planogramId,
    arrangement,
    storeId,
  );
}

export async function assignPlanogramToShelf(
  shelfId: string,
  planogramId: string,
  arrangement: PlanogramArrangement,
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

export async function updateShelfArrangement(
  shelfId: string,
  arrangement: PlanogramArrangement,
): Promise<Shelf | null> {
  return mockAnalysisApiClient.updateShelfArrangement(shelfId, arrangement);
}

export async function createPlanogram(payload: PlanogramPayload): Promise<PlanogramPayload> {
  const response = await apiClient.post<PlanogramResponse>(
    "/planograms",
    payload as CreatePlanogramPayload,
  );
  return toPlanogramPayload(response);
}

export async function updatePlanogram(id: string, payload: PlanogramPayload): Promise<PlanogramPayload> {
  if (!isUuid(id)) {
    throw new Error("Invalid planogram id. Expected UUID.");
  }

  const response = await apiClient.put<PlanogramResponse>(
    `/planograms/${id}`,
    payload as UpdatePlanogramPayload,
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
