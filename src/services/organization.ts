import { promoApiClient } from "@/lib/promo-api-client";

const API_PREFIX = "/api/v1";

export interface OrganizationUserResponse {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "checker" | "maker";
  is_active: boolean;
  last_login_at: string | null;
}

export async function listOrganizationUsers(): Promise<OrganizationUserResponse[]> {
  const { data } = await promoApiClient.get<OrganizationUserResponse[]>(
    `${API_PREFIX}/organization/users`,
  );
  return data;
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getOrganization(): Promise<Organization> {
  const { data } = await promoApiClient.get<Organization>(
    `${API_PREFIX}/organization`,
  );
  return data;
}

