import { apiClient } from "@/queries/shared";

export interface StoreFixtureApiModel {
  id: string;
  store_id: string;
  type: string;
  code?: string;
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

export interface CreateStoreFixturePayload {
  type: string;
  code?: string;
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

export interface UpdateStoreFixturePayload {
  type?: string;
  code?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  dimension_unit?: string;
  physical_location?: {
    section?: string;
    aisle?: string;
    zone?: string;
  };
}

export async function fetchStoreFixtures(): Promise<StoreFixtureApiModel[]> {
  return apiClient.get<StoreFixtureApiModel[]>("/fixtures");
}

export async function createStoreFixture(
  storeId: string,
  payload: CreateStoreFixturePayload,
): Promise<StoreFixtureApiModel> {
  return apiClient.post<StoreFixtureApiModel>("/fixtures", payload, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function updateStoreFixture(
  storeId: string,
  fixtureId: string,
  payload: UpdateStoreFixturePayload,
): Promise<StoreFixtureApiModel> {
  return apiClient.put<StoreFixtureApiModel>(`/fixtures/${fixtureId}`, payload, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function deleteStoreFixture(
  storeId: string,
  fixtureId: string,
): Promise<void> {
  return apiClient.delete(`/fixtures/${fixtureId}`, {
    headers: { "X-Store-Id": storeId },
  });
}
