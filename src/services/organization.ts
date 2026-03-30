import { promoApiClient } from "@/lib/promo-api-client";

const API_PREFIX = "/api/v1";

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

