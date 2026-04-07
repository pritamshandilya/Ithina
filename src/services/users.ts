import { promoApiClient } from "@/lib/promo-api-client";

const API_PREFIX = "/api/v1";

export interface StoreUserDetail {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "maker" | "checker";
  is_active: boolean;
  last_login_at: string | null;
  store_ids: string[];
  created_at: string;
  updated_at: string;
}

export async function getUser(userId: string): Promise<StoreUserDetail> {
  const { data } = await promoApiClient.get<StoreUserDetail>(
    `${API_PREFIX}/users/${userId}`,
  );
  return data;
}

