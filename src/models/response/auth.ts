/**
 * API Response Types – Auth
 *
 * Shapes returned by the authentication endpoints.
 */

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number; // seconds until access token expires
  role: "admin" | "maker" | "checker";
  organization: OrganizationResponse;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: "admin" | "maker" | "checker";
  is_active: boolean;
  organization: OrganizationResponse;
}

export interface OrganizationResponse {
  id: string;
  name: string;
}
