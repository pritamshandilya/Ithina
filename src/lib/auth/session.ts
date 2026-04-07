export function getAuthToken(): string | undefined {
  // Core API currently uses cookie-based auth; we don't persist a bearer token.
  // This helper exists so callers can attach an Authorization header if a token
  // is ever added in the future.
  return undefined;
}

