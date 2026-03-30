import { apiClient } from "@/lib/api-client";
import type { Organization, OrganizationUser } from "@/types/shared-api";

export async function fetchOrganization(): Promise<Organization> {
  const response = await apiClient.get<Organization>("/organization");
  return response.data;
}

export async function fetchOrganizationUsers(): Promise<OrganizationUser[]> {
  const response = await apiClient.get<OrganizationUser[]>("/organization/users");
  return response.data;
}
