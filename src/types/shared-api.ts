export type UserRole = "admin" | "maker" | "checker";

export interface Organization {
  id: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization: Organization;
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
  first_name: string;
  last_name: string;
  role: UserRole;
  organization: Organization;
}

export interface StoreApiModel {
  id: string;
  organization_id: string;
  name: string;
  address: string;
  region: string;
  currency: string;
  is_active: boolean;
  default_dimension_unit: "mm" | "cm" | "inch";
  maker_ids: string[];
  checker_ids: string[];
}

export interface OrganizationUser {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login_at?: string;
}
