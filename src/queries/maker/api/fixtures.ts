import { apiClient } from "@/queries/shared";

export interface CreateFixturePayload {
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
}

export interface FixtureResponse {
  id: string;
  store_id: string;
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
  created_at: string;
  updated_at: string;
}

export function fetchStoreFixtures(): Promise<FixtureResponse[]> {
  return apiClient.get<FixtureResponse[]>("/fixtures");
}

export function createFixture(payload: CreateFixturePayload): Promise<FixtureResponse> {
  return apiClient.post<FixtureResponse>("/fixtures", payload);
}
