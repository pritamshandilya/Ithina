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
 * Supply either `fixture_id` (existing fixture) or `fixture` (new fixture inline).
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
  const aisleMatch = res.fixture_aisle.match(/\d+/);
  const aisleNumber = aisleMatch ? Number(aisleMatch[0]) : 0;

  return {
    id: res.id,
    fixtureId: res.fixture_id,
    shelf_id: res.shelf_id,
    aisleNumber,
    aisle: res.fixture_aisle,
    bayNumber: 1, // Defaulting to 1
    shelfName: res.name,
    shelfCode: res.shelf_id,
    status: "never-audited",
    zone: res.fixture_zone,
    section: res.fixture_section,
    fixtureType: res.fixture_type,
    dimensions: `${res.fixture_width}x${res.fixture_height}x${res.fixture_depth}`,
    createdAt: new Date(res.created_at),
    updatedAt: new Date(res.updated_at),
    planogramId: undefined, // Planogram association logic to be added
  };
}
