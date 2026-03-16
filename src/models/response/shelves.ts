/**
 * API Response Types – Shelves
 *
 * Shapes returned by shelf-related endpoints.
 * Matches the backend ShelfResponse DTO.
 */

/** Shape returned by GET /shelves, GET /shelves/{id}, POST /shelves, PUT /shelves/{id} */
export interface ShelfResponse {
  id: string;
  fixture_id: string;
  shelf_id: string;
  name: string;
  fixture_type: string;
  fixture_width: number;
  fixture_height: number;
  fixture_depth: number;
  fixture_section: string;
  fixture_aisle: string;
  fixture_zone: string;
  created_at: string;
  updated_at: string;
}
