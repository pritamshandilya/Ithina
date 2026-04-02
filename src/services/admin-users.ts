import { promoApiClient } from "@/lib/promo-api-client";

const API_PREFIX = "/api/v1";

export type ApiUserRole = "admin" | "checker" | "maker";

export type ApiUserStatus = boolean;

export interface ApiOrganizationUserResponse {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: ApiUserRole;
  is_active: ApiUserStatus;
  last_login_at: string | null;
}

export async function listOrganizationUsers(): Promise<
  ApiOrganizationUserResponse[]
> {
  const { data } = await promoApiClient.get<ApiOrganizationUserResponse[]>(
    `${API_PREFIX}/organization/users`,
  );
  return data;
}

