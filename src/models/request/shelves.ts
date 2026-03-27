/**
 * API Payload Types – Shelves
 *
 * Request bodies sent to shelf-related endpoints.
 * Matches the backend ShelfCreateRequest / ShelfUpdateRequest DTOs.
 */

/**
 * Payload for POST /shelves.
 * Backend now requires an existing fixture_id plus shelf measurements.
 */
export interface CreateShelfPayload {
  code: string;
  name: string;
  fixture_id: string;
  width: number;
  height: number;
  vertical_position: number;
}

export interface ShelfFixtureDimensionsUpdateRequest {
  width?: number;
  height?: number;
  depth?: number;
}

export interface ShelfFixtureLocationUpdateRequest {
  section?: string;
  aisle?: string;
  zone?: string;
}

export interface ShelfFixtureUpdateRequest {
  type?: string;
  dimensions?: ShelfFixtureDimensionsUpdateRequest;
  physical_location?: ShelfFixtureLocationUpdateRequest;
}

/**
 * Payload for PUT /shelves/{id}
 * At least one field must be provided.
 */
export interface UpdateShelfPayload {
  code?: string;
  name?: string;
  fixture_id?: string;
  width?: number;
  height?: number;
  vertical_position?: number;
}
