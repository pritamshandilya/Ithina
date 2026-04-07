import { promoApiClient } from "@/lib/promo-api-client";
import type {
  ApiUserCreateRequest,
  ApiUserDetailResponse,
  ApiUserResponse,
  ApiUserUpdateRequest,
} from "@/types/api/users";

export type { ApiUserResponse as ApiOrganizationUserResponse };
export type { ApiUserDetailResponse };
export type { ApiUserCreateRequest, ApiUserUpdateRequest };
export type { ApiUserRole } from "@/types/api/users";

const API_PREFIX = "/api/v1";

export async function listOrganizationUsers(): Promise<ApiUserResponse[]> {
  const { data } = await promoApiClient.get<ApiUserResponse[]>(
    `${API_PREFIX}/organization/users`,
  );
  return data;
}

export async function createAdminUser(
  payload: ApiUserCreateRequest,
): Promise<ApiUserDetailResponse> {
  const { data } = await promoApiClient.post<ApiUserDetailResponse>(
    `${API_PREFIX}/users`,
    payload,
  );
  return data;
}

export async function updateAdminUser(
  userId: string,
  payload: ApiUserUpdateRequest,
): Promise<ApiUserDetailResponse> {
  const { data } = await promoApiClient.put<ApiUserDetailResponse>(
    `${API_PREFIX}/users/${userId}`,
    payload,
  );
  return data;
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await promoApiClient.delete(`${API_PREFIX}/users/${userId}`);
}

