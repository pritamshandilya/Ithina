import { promoApiClient } from "@/lib/promo-api-client";
import type {
  ApiUserCreateRequest,
  ApiUserDetailResponse,
  ApiUserUpdateRequest,
} from "@/types/api/users";

const API_PREFIX = "/api/v1";

export type { ApiUserDetailResponse as UserDetail };

export async function getUser(userId: string): Promise<ApiUserDetailResponse> {
  const { data } = await promoApiClient.get<ApiUserDetailResponse>(
    `${API_PREFIX}/users/${userId}`,
  );
  return data;
}

export async function createUser(
  payload: ApiUserCreateRequest,
): Promise<ApiUserDetailResponse> {
  const { data } = await promoApiClient.post<ApiUserDetailResponse>(
    `${API_PREFIX}/users`,
    payload,
  );
  return data;
}

export async function updateUser(
  userId: string,
  payload: ApiUserUpdateRequest,
): Promise<ApiUserDetailResponse> {
  const { data } = await promoApiClient.put<ApiUserDetailResponse>(
    `${API_PREFIX}/users/${userId}`,
    payload,
  );
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await promoApiClient.delete(`${API_PREFIX}/users/${userId}`);
}

