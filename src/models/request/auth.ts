/**
 * API Payload Types – Auth
 *
 * Request bodies sent to authentication endpoints.
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}
