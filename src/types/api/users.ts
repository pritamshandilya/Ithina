/**
 * TypeScript mirrors of the FastAPI Pydantic DTOs for users.
 * Keep in sync with: dd_promo_api_v1/app/io/request/users.py
 *                    dd_promo_api_v1/app/io/response/users.py
 */

export type ApiUserRole = "admin" | "maker" | "checker";

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface ApiUserResponse {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: ApiUserRole;
  is_active: boolean;
  last_login_at: string | null;
}

export interface ApiUserDetailResponse extends ApiUserResponse {
  store_ids: string[];
  created_at: string;
  updated_at: string;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface ApiUserCreateRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: ApiUserRole;
  is_active?: boolean;
  store_ids?: string[];
}

export interface ApiUserUpdateRequest {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  password?: string | null;
  role?: ApiUserRole | null;
  is_active?: boolean | null;
  store_ids?: string[] | null;
}
