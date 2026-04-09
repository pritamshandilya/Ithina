const AUTH_TOKEN_KEY = "promo_auth_token";

export function getAuthToken(): string | undefined {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ?? undefined;
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

