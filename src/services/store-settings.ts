import type { StoreDimensionUnit } from "@/constants/dimensions";
import { promoApiClient } from "@/lib/promo-api-client";
import { StoreContext } from "@/lib/store-context";
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

function requireActiveStoreId(): string {
  const id = StoreContext.getStoreId();
  if (!id?.trim()) {
    throw new Error("Select a store to manage settings.");
  }
  return id;
}

function mapStoreToProfile(store: StoreResponse): StoreProfile {
  return {
    id: store.id,
    name: store.name,
    address: store.address,
    region: store.region,
    currency: store.currency,
    defaultDimensions: "mm",
    isActive: store.is_active,
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

export async function getStoreProfile(): Promise<StoreProfile> {
  const storeId = requireActiveStoreId();

  const { data } = await promoApiClient.get<StoreResponse[]>(`${API_PREFIX}/stores`);
  const store = data.find((s) => s.id === storeId);
  if (!store) {
    throw new Error("Store not found");
  }

  return mapStoreToProfile(store);
}

export async function updateStoreProfile(data: {
  name: string;
  address: string;
  region: string;
  currency: string;
  defaultDimensions: StoreDimensionUnit;
}): Promise<StoreProfile> {
  const { name, address, region, currency } = data;
  const storeId = requireActiveStoreId();

  const { data: updated } = await promoApiClient.put<StoreResponse>(
    `${API_PREFIX}/store`,
    {
      name,
      address,
      region,
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
  const storeId = requireActiveStoreId();

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
  const storeId = requireActiveStoreId();

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
  const storeId = requireActiveStoreId();

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
