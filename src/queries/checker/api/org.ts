import type {
  AuthSessionUser,
  OrganizationInfo,
  UserRole,
} from "@/lib/auth/session";
import { apiClient } from "@/queries/shared";
import type { Store } from "@/types/checker";

export type OrgUserType = UserRole;
export type StoreAssignableUserRole = "maker" | "checker";

interface OrgUserApiModel {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: UserRole;
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
  };
  is_active: boolean;
  last_login_at?: string | null;
}

function mapOrgUser(user: OrgUserApiModel): AuthSessionUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    role: user.role,
    organization: user.organization ?? {
      id: user.organization_id ?? "",
      name: "",
    },
    isActive: user.is_active,
    lastLoginAt: user.last_login_at ?? undefined,
  };
}

interface OrgStoreApiModel {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  name: string;
  address: string;
  region?: string;
  is_active?: boolean;
  status?: "Active" | "Inactive" | "active" | "inactive";
  currency: string;
  default_dimension_unit?: string;
  default_compliance_rule_set_id?: string | null;
  maker_ids?: string[];
  checker_ids?: string[];
  created_at: string;
  updated_at: string;
}

interface UpdateStorePayload {
  name: string;
  address: string;
  region: string;
  is_active: boolean;
  currency: string;
  default_dimension_unit: string;
}

function mapOrgStore(store: OrgStoreApiModel): Store {
  const normalizedStatus =
    typeof store.is_active === "boolean"
      ? store.is_active
        ? "Active"
        : "Inactive"
      : store.status === "inactive" || store.status === "Inactive"
        ? "Inactive"
        : "Active";
  const isActive =
    typeof store.is_active === "boolean"
      ? store.is_active
      : normalizedStatus === "Active";
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    region: store.region,
    currency: store.currency,
    default_dimensions: store.default_dimension_unit,
    default_compliance_rule_set_id: store.default_compliance_rule_set_id ?? null,
    is_active: isActive,
    maker_ids: store.maker_ids,
    user_ids: store.checker_ids,
    created: store.created_at,
    status: normalizedStatus,
  };
}

export async function fetchOrganization(): Promise<OrganizationInfo> {
  return apiClient.get<OrganizationInfo>("/organization");
}

export async function fetchOrgStores(): Promise<Store[]> {
  const stores = await apiClient.get<OrgStoreApiModel[]>("/stores");
  return stores.map(mapOrgStore);
}

export async function fetchScopedStore(storeId: string): Promise<Store> {
  const store = await apiClient.get<OrgStoreApiModel>("/store", undefined, {
    headers: { "X-Store-Id": storeId },
  });
  return mapOrgStore(store);
}

export async function fetchStoreById(storeId: string): Promise<Store> {
  const store = await apiClient.get<OrgStoreApiModel>(`/stores/${storeId}`);
  return mapOrgStore(store);
}

export async function assignUserToStore(
  storeId: string,
  userId: string,
): Promise<void> {
  return apiClient.put<void>(`/store/users/${userId}`, undefined, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function removeUserFromStore(
  storeId: string,
  userId: string,
): Promise<void> {
  return apiClient.delete<void>(`/store/users/${userId}`, {
    headers: { "X-Store-Id": storeId },
  });
}

export async function fetchOrgUsers(
  userType?: OrgUserType,
): Promise<AuthSessionUser[]> {
  const params: Record<string, string> = {};
  if (userType) params.user_type = userType;

  const users = await apiClient.get<OrgUserApiModel[]>("/organization/users", params);
  return users.map(mapOrgUser);
}

export async function fetchStoreUsers(
  storeId: string,
  userType?: OrgUserType,
): Promise<AuthSessionUser[]> {
  const params: Record<string, string> = {};
  if (userType) params.user_type = userType;

  const users = await apiClient.get<OrgUserApiModel[]>(
    "/store/users",
    params,
    { headers: { "X-Store-Id": storeId } },
  );

  return users.map(mapOrgUser);
}

export async function createStore(data: {
  name: string;
  address: string;
  region: string;
  currency: string;
  default_dimensions: string;
  // Store onboarding creates new stores as active by default.
  is_active?: boolean;
}): Promise<Store> {
  const payload = {
    name: data.name,
    address: data.address,
    region: data.region,
    is_active: data.is_active ?? true,
    currency: data.currency,
    default_dimension_unit: data.default_dimensions,
  };
  const store = await apiClient.post<OrgStoreApiModel>("/stores", payload);
  return mapOrgStore(store);
}

export async function deleteStore(storeId: string): Promise<void> {
  return apiClient.delete<void>("/store", {
    headers: { "X-Store-Id": storeId },
  });
}

export async function updateStore(
  storeId: string,
  data: {
    name: string;
    address: string;
    region: string;
    status: "Active" | "Inactive";
    currency: string;
    default_dimensions: string;
  },
): Promise<Store> {
  const payload: UpdateStorePayload = {
    name: data.name,
    address: data.address,
    region: data.region,
    is_active: data.status === "Active",
    currency: data.currency,
    default_dimension_unit: data.default_dimensions,
  };

  const store = await apiClient.put<OrgStoreApiModel>("/store", payload, {
    headers: { "X-Store-Id": storeId },
  });
  return mapOrgStore(store);
}

export async function updateStoreComplianceSettings(
  storeId: string,
  data: {
    default_compliance_rule_set_id: string | null;
  },
): Promise<Store> {
  const payload = {
    default_compliance_rule_set_id: data.default_compliance_rule_set_id,
  };

  const store = await apiClient.put<OrgStoreApiModel>("/store", payload, {
    headers: { "X-Store-Id": storeId },
  });
  return mapOrgStore(store);
}

export interface UpsertUserPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  role: OrgUserType;
  is_active?: boolean;
  store_ids?: string[];
}

export async function createUser(
  payload: UpsertUserPayload,
): Promise<AuthSessionUser> {
  const user = await apiClient.post<OrgUserApiModel>("/users", payload);
  return mapOrgUser(user);
}

export async function inviteUser(
  payload: UpsertUserPayload,
): Promise<AuthSessionUser> {
  const user = await apiClient.post<OrgUserApiModel>("/users/invite", payload);
  return mapOrgUser(user);
}

export async function fetchUserById(userId: string): Promise<AuthSessionUser> {
  const user = await apiClient.get<OrgUserApiModel>(`/users/${userId}`);
  return mapOrgUser(user);
}

export async function updateUser(
  userId: string,
  payload: Partial<UpsertUserPayload>,
): Promise<AuthSessionUser> {
  const user = await apiClient.put<OrgUserApiModel>(`/users/${userId}`, payload);
  return mapOrgUser(user);
}

export async function deactivateUser(userId: string): Promise<void> {
  return apiClient.delete<void>(`/users/${userId}`);
}
