import { promoApiClient } from "@/lib/promo-api-client";
import type { StoreDimensionUnit } from "@/constants/dimensions";
import type { StoreProfile, StoreStaffMember, StoreStaffRole } from "@/types/store-settings";

const API_PREFIX = "/api/v1";

interface StoreResponse {
  id: string;
  organization_id: string;
  created_by_user_id: string;
  name: string;
  address: string;
  region: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserResponse {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: StoreStaffRole;
  is_active: boolean;
  last_login_at: string | null;
}

function mapStoreToProfile(store: StoreResponse): StoreProfile {
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    currency: store.currency,
    // Backend doesn't yet model defaultDimensions; keep UI default as "mm".
    defaultDimensions: "mm",
  };
}

function mapUserToStaff(user: UserResponse): StoreStaffMember {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
  };
}

async function resolveStoreId(): Promise<string> {
  const { data } = await promoApiClient.get<StoreResponse[]>(
    `${API_PREFIX}/stores`,
  );

  if (!data.length) {
    throw new Error("No stores available for current user");
  }

  // For now, use the first store in the list as the active store.
  return data[0].id;
}

export async function getStoreProfile(): Promise<StoreProfile> {
  const { data } = await promoApiClient.get<StoreResponse[]>(
    `${API_PREFIX}/stores`,
  );

  if (!data.length) {
    throw new Error("No stores available for current user");
  }

  // Use the first store in the list as the active store profile.
  return mapStoreToProfile(data[0]);
}

export async function updateStoreProfile(data: {
  name: string;
  address: string;
  currency: string;
  defaultDimensions: StoreDimensionUnit;
}): Promise<StoreProfile> {
  const { name, address, currency } = data;

  const storeId = await resolveStoreId();

  const { data: updated } = await promoApiClient.put<StoreResponse>(
    `${API_PREFIX}/store`,
    {
      name,
      address,
      currency,
    },
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
  );

  return mapStoreToProfile(updated);
}

export async function getStoreStaff(): Promise<StoreStaffMember[]> {
  const storeId = await resolveStoreId();

  const { data } = await promoApiClient.get<UserResponse[]>(
    `${API_PREFIX}/store/users`,
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
  );
  return data.map(mapUserToStaff);
}

export async function getAssignableStoreUsers(): Promise<StoreStaffMember[]> {
  const [{ data: orgUsers }, currentStaff] = await Promise.all([
    promoApiClient.get<UserResponse[]>(`${API_PREFIX}/organization/users`),
    getStoreStaff(),
  ]);

  const assignedIds = new Set(currentStaff.map((u) => u.id));

  return orgUsers
    .filter(
      (u) =>
        !assignedIds.has(u.id) &&
        (u.role === "maker" || u.role === "checker" || u.role === "admin"),
    )
    .map(mapUserToStaff);
}

export async function assignStoreUser(userId: string): Promise<StoreStaffMember[]> {
  const storeId = await resolveStoreId();

  const { data } = await promoApiClient.put<UserResponse[]>(
    `${API_PREFIX}/store/users/${userId}`,
    undefined,
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
  );
  return data.map(mapUserToStaff);
}

export async function removeStoreUser(userId: string): Promise<StoreStaffMember[]> {
  const storeId = await resolveStoreId();

  const { data } = await promoApiClient.delete<UserResponse[]>(
    `${API_PREFIX}/store/users/${userId}`,
    {
      headers: {
        "X-Store-Id": storeId,
      },
    },
  );
  return data.map(mapUserToStaff);
}

