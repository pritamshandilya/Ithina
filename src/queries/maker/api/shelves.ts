/**
 * Shelf API Functions
 *
 * Real API calls for all shelf CRUD operations.
 * Endpoints: POST/GET/PUT/DELETE /shelves
 */

import { apiClient } from "@/queries/shared";
import type { CreateShelfPayload, UpdateShelfPayload } from "@/models/request/shelves";
import type { ShelfResponse } from "@/models/response/shelves";
import type { Shelf } from "@/types/maker";

/**
 * Fetch all shelves for the current store.
 *
 * @param fixtureId - Optional fixture UUID to filter shelves by fixture
 */
export function listShelves(fixtureId?: string): Promise<ShelfResponse[]> {
  return apiClient.get<ShelfResponse[]>("/shelves", fixtureId ? { fixture_id: fixtureId } : undefined);
}

/**
 * Fetch a single shelf by its UUID.
 *
 * @param shelfId - The shelf UUID
 */
export function getShelf(shelfId: string): Promise<ShelfResponse> {
  return apiClient.get<ShelfResponse>(`/shelves/${shelfId}`);
}

/**
 * Create a new shelf.
 * Supply `fixture_id` and shelf dimensions.
 *
 * @param payload - CreateShelfPayload
 */
export function createShelf(payload: CreateShelfPayload): Promise<ShelfResponse> {
  return apiClient.post<ShelfResponse>("/shelves", payload);
}

/**
 * Update an existing shelf's shelf_id and/or name.
 *
 * @param shelfId - The shelf UUID to update
 * @param payload - UpdateShelfPayload (at least one field required)
 */
export function updateShelf(shelfId: string, payload: UpdateShelfPayload): Promise<ShelfResponse> {
  return apiClient.put<ShelfResponse>(`/shelves/${shelfId}`, payload);
}

/**
 * Delete a shelf by UUID.
 *
 * @param shelfId - The shelf UUID to delete
 */
export function deleteShelf(shelfId: string): Promise<void> {
  return apiClient.delete<void>(`/shelves/${shelfId}`);
}

/**
 * Maps a real API ShelfResponse to the internal Shelf type used by the UI.
 * This ensures compatibility across the application.
 */
export function mapShelfResponseToShelf(res: ShelfResponse): Shelf {
  const shelfCode = res.code ?? res.shelf_id ?? "";
  const fixtureWidth = res.fixture?.dimensions.width ?? res.fixture_width;
  const fixtureHeight = res.fixture?.dimensions.height ?? res.fixture_height;
  const fixtureDepth = res.fixture?.dimensions.depth ?? res.fixture_depth;
  const dimensionUnit = res.fixture?.dimension_unit ?? res.fixture_dimension_unit;
  const aisleCode = res.fixture?.physical_location.aisle ?? res.fixture_aisle ?? "";
  const zone = res.fixture?.physical_location.zone ?? res.fixture_zone;
  const section = res.fixture?.physical_location.section ?? res.fixture_section;
  const fixtureType = res.fixture?.type ?? res.fixture_type;
  const bayCode = (() => {
    const parts = String(shelfCode).split("-");
    return (parts.at(-1) ?? "").trim();
  })();

  return {
    id: res.id,
    fixtureId: res.fixture?.id ?? res.fixture_id,
    shelf_id: shelfCode,
    aisleCode,
    bayCode,
    // Numeric derivatives are intentionally not derived from alphanumeric codes.
    // UI should render codes directly from `aisleCode`/`bayCode`.
    aisleNumber: undefined,
    bayNumber: undefined,
    shelfName: res.name,
    shelfCode,
    status: "never-audited",
    zone,
    section,
    fixtureType,
    width: res.width,
    height: res.height,
    depth: fixtureDepth,
    dimensionUnit,
    dimensions:
      fixtureWidth != null && fixtureHeight != null && fixtureDepth != null
        ? `${fixtureWidth}x${fixtureHeight}x${fixtureDepth}${dimensionUnit ? ` ${dimensionUnit}` : ""}`
        : undefined,
    verticalPosition: res.vertical_position,
    createdAt: new Date(res.created_at),
    updatedAt: new Date(res.updated_at),
    planogramId: undefined, // Planogram association logic to be added
  };
}
