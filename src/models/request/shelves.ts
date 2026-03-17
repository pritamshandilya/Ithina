/**
 * API Payload Types – Shelves
 *
 * Request bodies sent to shelf-related endpoints.
 * Matches the backend ShelfCreateRequest / ShelfUpdateRequest DTOs.
 */

export interface ShelfFixtureDimensionsPayload {
  width: number;
  height: number;
  depth: number;
}

export interface ShelfFixtureLocationPayload {
  section: string;
  aisle: string;
  zone: string;
}

export interface ShelfFixturePayload {
  type: string;
  dimensions: ShelfFixtureDimensionsPayload;
  dimension_unit: string;
  physical_location: ShelfFixtureLocationPayload;
}

/**
 * Payload for POST /shelves
 * Either fixture_id (existing fixture) or fixture (new fixture) must be provided.
 */
export interface CreateShelfPayload {
  shelf_id: string;
  name: string;
  fixture_id?: string;
  fixture?: ShelfFixturePayload;
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
  shelf_id?: string;
  name?: string;
}
