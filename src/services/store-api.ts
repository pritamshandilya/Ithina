import { apiClient } from "@/lib/api-client";
import type { OrganizationUser, StoreApiModel } from "@/types/shared-api";

export async function fetchStores(): Promise<StoreApiModel[]> {
  const response = await apiClient.get<StoreApiModel[]>("/stores");
  return response.data;
}

export async function fetchStore(storeId: string): Promise<StoreApiModel> {
  const response = await apiClient.get<StoreApiModel>("/store", {
    headers: { "X-Store-Id": storeId },
  });
  return response.data;
}

export async function updateStore(
  storeId: string,
  payload: {
    name: string;
    address: string;
    region: string;
    currency: string;
    is_active: boolean;
    default_dimension_unit: "mm" | "cm" | "inch";
  },
): Promise<StoreApiModel> {
  const response = await apiClient.put<StoreApiModel>("/store", payload, {
    headers: { "X-Store-Id": storeId },
  });
  return response.data;
}

export async function fetchStoreUsers(storeId: string): Promise<OrganizationUser[]> {
  const response = await apiClient.get<OrganizationUser[]>("/store/users", {
    headers: { "X-Store-Id": storeId },
  });
  return response.data;
}

export async function addStoreUser(
  storeId: string,
  userId: string,
): Promise<OrganizationUser[]> {
  const response = await apiClient.put<OrganizationUser[]>(
    `/store/users/${userId}`,
    null,
    { headers: { "X-Store-Id": storeId } },
  );
  return response.data;
}

export async function removeStoreUser(
  storeId: string,
  userId: string,
): Promise<OrganizationUser[]> {
  const response = await apiClient.delete<OrganizationUser[]>(
    `/store/users/${userId}`,
    { headers: { "X-Store-Id": storeId } },
  );
  return response.data;
}
