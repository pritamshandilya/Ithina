import { promoApiClient } from "@/lib/promo-api-client";

const API_PREFIX = "/api/v1";

export interface Store {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  name: string;
  address: string;
  region: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateStorePayload {
  name: string;
  address: string;
  region: string;
  currency: string;
  is_active?: boolean;
}

export async function listStores(): Promise<Store[]> {
  const { data } = await promoApiClient.get<Store[]>(`${API_PREFIX}/stores`);
  return data;
}

export async function createStore(payload: CreateStorePayload): Promise<Store> {
  const { data } = await promoApiClient.post<Store>(
    `${API_PREFIX}/stores`,
    payload,
  );
  return data;
}

export async function deleteCurrentStore(storeId: string): Promise<void> {
  await promoApiClient.delete(`${API_PREFIX}/store`, {
    headers: {
      "X-Store-Id": storeId,
    },
  });
}

