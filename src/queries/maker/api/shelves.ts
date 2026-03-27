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
  const aisleCode = res.fixture_aisle ?? "";
  const bayCode = (() => {
    const parts = String(res.shelf_id ?? "").split("-");
    return (parts.at(-1) ?? "").trim();
  })();

  return {
    id: res.id,
    fixtureId: res.fixture_id,
    shelf_id: res.shelf_id,
    aisleCode,
    bayCode,
    // Numeric derivatives are intentionally not derived from alphanumeric codes.
    // UI should render codes directly from `aisleCode`/`bayCode`.
    aisleNumber: undefined,
    bayNumber: undefined,
    shelfName: res.name,
    shelfCode: res.shelf_id,
    status: "never-audited",
    zone: res.fixture_zone,
    section: res.fixture_section,
    fixtureType: res.fixture_type,
    dimensions: `${res.fixture_width}x${res.fixture_height}x${res.fixture_depth} ${res.fixture_dimension_unit}`,
    createdAt: new Date(res.created_at),
    updatedAt: new Date(res.updated_at),
    planogramId: undefined, // Planogram association logic to be added
  };
}
