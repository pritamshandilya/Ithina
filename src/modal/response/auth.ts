/**
 * API Response Types – Auth
 *
 * Shapes returned by the authentication endpoints.
 */

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until accessToken expires
  user: AuthUserResponse;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "maker" | "checker";
  storeId: string;
  storeName: string;
  /** Checker only: list of store IDs this checker manages */
  assignedStoreIds?: string[];
}
