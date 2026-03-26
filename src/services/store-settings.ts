import { apiDelay } from "@/lib/api-delay";
import { MOCK_ORG_USERS, MOCK_STORE_PROFILE, MOCK_STORE_STAFF } from "@/mocks/store-settings";
import type { StoreDimensionUnit } from "@/constants/dimensions";
import type { StoreProfile, StoreStaffMember } from "@/types/store-settings";

let profileState: StoreProfile = { ...MOCK_STORE_PROFILE };
let staffState: StoreStaffMember[] = MOCK_STORE_STAFF.map((u) => ({ ...u }));

function cloneAssignable(): StoreStaffMember[] {
  const assigned = new Set(staffState.map((s) => s.id));
  return MOCK_ORG_USERS.filter(
    (u) => !assigned.has(u.id) && (u.role === "maker" || u.role === "checker"),
  ).map((u) => ({ ...u }));
}

export async function getStoreProfile(): Promise<StoreProfile> {
  await apiDelay(200);
  return { ...profileState };
}

export async function updateStoreProfile(data: {
  name: string;
  address: string;
  currency: string;
  defaultDimensions: StoreDimensionUnit;
}): Promise<StoreProfile> {
  await apiDelay(450);
  profileState = {
    ...profileState,
    name: data.name,
    address: data.address,
    currency: data.currency,
    defaultDimensions: data.defaultDimensions,
  };
  return { ...profileState };
}

export async function getStoreStaff(): Promise<StoreStaffMember[]> {
  await apiDelay(200);
  return staffState.map((u) => ({ ...u }));
}

export async function getAssignableStoreUsers(): Promise<StoreStaffMember[]> {
  await apiDelay(150);
  return cloneAssignable();
}

export async function assignStoreUser(userId: string): Promise<StoreStaffMember[]> {
  await apiDelay(350);
  const pool = MOCK_ORG_USERS.find((u) => u.id === userId);
  if (
    !pool ||
    staffState.some((s) => s.id === userId) ||
    (pool.role !== "maker" && pool.role !== "checker")
  ) {
    return staffState.map((u) => ({ ...u }));
  }
  staffState = [...staffState, { ...pool }];
  return staffState.map((u) => ({ ...u }));
}

export async function removeStoreUser(userId: string): Promise<StoreStaffMember[]> {
  await apiDelay(300);
  const user = staffState.find((s) => s.id === userId);
  if (!user || user.role === "admin") {
    return staffState.map((u) => ({ ...u }));
  }
  staffState = staffState.filter((s) => s.id !== userId);
  return staffState.map((u) => ({ ...u }));
}

