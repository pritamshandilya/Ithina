import type { StoreDimensionUnit } from "@/constants/dimensions";
import { getSelectedStoreId } from "@/lib/auth/session";
import { store } from "@/store";
import {
  addStoreUser,
  fetchStore,
  fetchStoreUsers,
  removeStoreUser as removeStoreUserApi,
  updateStore,
} from "@/services/store-api";
import { fetchOrganizationUsers } from "@/services/organization-api";
import type { StoreProfile, StoreStaffMember } from "@/types/store-settings";
import type { OrganizationUser } from "@/types/shared-api";

function resolveStoreId(): string {
  const stateStoreId = store.getState().session.selectedStoreId;
  const persistedStoreId = getSelectedStoreId();
  const resolved = stateStoreId ?? persistedStoreId;
  if (!resolved) {
    throw new Error("No active store selected");
  }
  return resolved;
}

function mapStoreUser(user: OrganizationUser): StoreStaffMember {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
  };
}

export async function getStoreProfile(): Promise<StoreProfile> {
  const selectedStoreId = resolveStoreId();
  const storeProfile = await fetchStore(selectedStoreId);
  return {
    id: storeProfile.id,
    name: storeProfile.name,
    address: storeProfile.address,
    region: storeProfile.region,
    currency: storeProfile.currency,
    defaultDimensions: storeProfile.default_dimension_unit,
  };
}

export async function updateStoreProfile(data: {
  name: string;
  address: string;
  region: string;
  currency: string;
  defaultDimensions: StoreDimensionUnit;
}): Promise<StoreProfile> {
  const selectedStoreId = resolveStoreId();
  const current = await fetchStore(selectedStoreId);
  const updated = await updateStore(selectedStoreId, {
    name: data.name,
    address: data.address,
    region: data.region,
    currency: data.currency,
    is_active: current.is_active,
    default_dimension_unit: data.defaultDimensions,
  });
  return {
    id: updated.id,
    name: updated.name,
    address: updated.address,
    region: updated.region,
    currency: updated.currency,
    defaultDimensions: updated.default_dimension_unit,
  };
}

export async function getStoreStaff(): Promise<StoreStaffMember[]> {
  const selectedStoreId = resolveStoreId();
  const storeUsers = await fetchStoreUsers(selectedStoreId);
  return storeUsers.map(mapStoreUser);
}

export async function getAssignableStoreUsers(): Promise<StoreStaffMember[]> {
  const selectedStoreId = resolveStoreId();
  const [storeUsers, orgUsers] = await Promise.all([
    fetchStoreUsers(selectedStoreId),
    fetchOrganizationUsers(),
  ]);
  const assignedIds = new Set(storeUsers.map((user) => user.id));
  return orgUsers
    .filter(
      (user) =>
        !assignedIds.has(user.id) &&
        (user.role === "maker" || user.role === "checker"),
    )
    .map(mapStoreUser);
}

export async function assignStoreUser(userId: string): Promise<StoreStaffMember[]> {
  const selectedStoreId = resolveStoreId();
  const updatedUsers = await addStoreUser(selectedStoreId, userId);
  return updatedUsers.map(mapStoreUser);
}

export async function removeStoreUser(userId: string): Promise<StoreStaffMember[]> {
  const selectedStoreId = resolveStoreId();
  const updatedUsers = await removeStoreUserApi(selectedStoreId, userId);
  return updatedUsers.map(mapStoreUser);
}
