import type { StoreDimensionUnit } from "@/constants/dimensions";

export type StoreStaffRole = "admin" | "maker" | "checker";

export interface StoreProfile {
  id: string;
  name: string;
  address: string;
  currency: string;
  defaultDimensions: StoreDimensionUnit;
}

export interface StoreStaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StoreStaffRole;
}
