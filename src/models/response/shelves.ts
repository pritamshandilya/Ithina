/**
 * API Response Types – Shelves
 *
 * Shapes returned by shelf-related endpoints.
 * Matches the backend ShelfResponse DTO.
 */

/** Shape returned by GET /shelves, GET /shelves/{id}, POST /shelves, PUT /shelves/{id} */
export interface ShelfResponse {
  id: string;
  fixture_id?: string;
  shelf_id?: string;
  code?: string;
  name: string;
  width: number;
  height: number;
  vertical_position: number;
  fixture_type?: string;
  fixture_width?: number;
  fixture_height?: number;
  fixture_depth?: number;
  fixture_dimension_unit?: string;
  fixture_section?: string;
  fixture_aisle?: string;
  fixture_zone?: string;
  fixture?: {
    id: string;
    type: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    dimension_unit: string;
    physical_location: {
      section: string;
      aisle: string;
      zone: string;
    };
  };
  created_at: string;
  updated_at: string;
}
