/**
 * API Response Types – Shelves
 *
 * Shapes returned by shelf-related endpoints.
 * Matches the backend ShelfResponse DTO.
 */

export interface ShelfFixtureDimensionsResponse {
  width: number;
  height: number;
  depth: number;
}

export interface ShelfFixtureLocationResponse {
  section: string;
  aisle: string;
  zone: string;
}

export interface ShelfFixtureResponse {
  id: string;
  type: string;
  dimensions: ShelfFixtureDimensionsResponse;
  physical_location: ShelfFixtureLocationResponse;
}

/** Shape returned by GET /shelves, GET /shelves/{id}, POST /shelves, PUT /shelves/{id} */
export interface ShelfResponse {
  id: string;
  fixture_id: string;
  shelf_id: string;
  name: string;
  fixture: ShelfFixtureResponse;
  created_at: string;
  updated_at: string;
}
