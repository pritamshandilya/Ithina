import { promoApiClient } from "@/lib/promo-api-client";
import type { ApiUserResponse } from "@/types/api/users";

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

export type StoreStaffUserType = "admin" | "checker" | "maker";

/** Store staff row from GET /store/users (matches API UserResponse). */
export type StoreUser = ApiUserResponse;

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

export async function listStoreUsers(
  storeId: string,
  userType?: StoreStaffUserType,
): Promise<StoreUser[]> {
  const url = userType
    ? `${API_PREFIX}/store/users?user_type=${encodeURIComponent(userType)}`
    : `${API_PREFIX}/store/users`;

  const { data } = await promoApiClient.get<StoreUser[]>(url, {
    headers: {
      "X-Store-Id": storeId,
    },
  });

  return data;
}

export async function updateStoreActive(
  storeId: string,
  is_active: boolean,
): Promise<Store> {
  const { data } = await promoApiClient.put<Store>(
    `${API_PREFIX}/store`,
    { is_active },
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
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

/** Admin: assign an org user to a store (PUT /store/users/{user_id} with X-Store-Id). */
export async function assignUserToStore(storeId: string, userId: string): Promise<void> {
  await promoApiClient.put(
    `${API_PREFIX}/store/users/${encodeURIComponent(userId)}`,
    {},
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
  );
}

