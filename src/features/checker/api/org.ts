import type { AuthSessionUser, OrganizationInfo } from "@/lib/auth/session";
import { apiClient } from "@/query/api-client";
import type { Store } from "@/types/checker";

export async function fetchOrganization(): Promise<OrganizationInfo> {
  return apiClient.get<OrganizationInfo>("/organization");
}

export async function fetchOrgStores(): Promise<Store[]> {
  return apiClient.get<Store[]>("/stores");
}

export async function fetchStoreById(storeId: string): Promise<Store> {
  return apiClient.get<Store>(`/stores/${storeId}`);
}

export async function updateStoreMakers(
  storeId: string,
  makerIds: string[],
): Promise<void> {
  return apiClient.put<void>(`/stores/${storeId}/makers`, {
    maker_ids: makerIds,
  });
}

export async function fetchOrgUsers(
  userType?: "maker" | "checker",
): Promise<AuthSessionUser[]> {
  const params: Record<string, string> = {};
  if (userType) params.user_type = userType;

  const users = await apiClient.get<any[]>("/users", params);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    organization: {
      id: user.organization_id,
      name: "",
    },
    isActive: user.is_active,
    lastLoginAt: user.last_login_at,
  }));
}

export async function fetchStoreUsers(
  storeId: string,
  userType?: "maker" | "checker",
): Promise<AuthSessionUser[]> {
  const params: Record<string, string> = {};
  if (userType) params.user_type = userType;

  const users = await apiClient.get<any[]>(`/stores/${storeId}/users`, params);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    organization: {
      id: user.organization_id,
      name: "",
    },
    isActive: user.is_active,
    lastLoginAt: user.last_login_at,
  }));
}

export async function createStore(data: {
  name: string;
  address: string;
  currency: string;
  default_dimensions: string;
}): Promise<Store> {
  return apiClient.post<Store>("/stores", data);
}

export async function updateStore(
  storeId: string,
  data: {
    name: string;
    address: string;
    currency: string;
    default_dimensions: string;
  },
): Promise<Store> {
  return apiClient.patch<Store>(`/stores/${storeId}`, data);
}
