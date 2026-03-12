/**
 * API Base Client
 *
 * Central HTTP client used by all API functions.
 * In production, set VITE_API_BASE_URL in your .env file.
 *
 * Provides:
 *  - Consistent base URL
 *  - Automatic JSON serialization / deserialization
 *  - Centralized request/response interceptor hooks
 *  - Structured ApiError with HTTP status for smart retry decisions
 *
 * Usage:
 *  import { apiClient } from "@/queries/shared";
 *  const data = await apiClient.get<UserResponse>("/users/me");
 */

import { ApiError } from "@/exceptions/ApiError";
import { getHttpConfig } from "@/lib/api/config";
import store from "@/store";
import { selectSelectedStore } from "@/store/selectors";

export { ApiError };

function getAuthToken(): string | null {
  try {
    return store.getState().auth?.token ?? null;
  } catch {
    return null;
  }
}

function getSelectedStoreId(): string | null {
  try {
    const selected = selectSelectedStore(store.getState());
    return selected?.id ?? null;
  } catch {
    return null;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : data && typeof data === "object" && "detail" in data
          ? String((data as { detail: unknown }).detail)
          : res.statusText || "An unexpected error occurred";

    // Surface 401/403 as ApiError so callers can handle session expiry
    throw new ApiError(res.status, res.statusText, message, data);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(extra as Record<string, string>),
  };

  // Attach auth token when available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Attach selected store ID when available
  const storeId = getSelectedStoreId();
  if (storeId) {
    headers["X-Store-Id"] = storeId;
  }

  return headers;
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown;
    params?: Record<string, string | number | boolean | undefined | null>;
    headers?: HeadersInit;
    timeoutMs?: number;
  },
): Promise<T> {
  let url = `${getHttpConfig().baseUrl}${path}`;

  if (options?.params) {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null) {
        qs.set(key, String(value));
      }
    }
    const queryString = qs.toString();
    if (queryString) url += `?${queryString}`;
  }

  const controller = new AbortController();
  const timeout =
    typeof options?.timeoutMs === "number" && options.timeoutMs > 0
      ? options.timeoutMs
      : 30_000;

  const timer = setTimeout(() => controller.abort(), timeout);

  const res = await fetch(url, {
    method,
    headers: buildHeaders(options?.headers),
    body:
      options?.body instanceof URLSearchParams
        ? options.body
        : options?.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timer);
  });

  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ) => request<T>("GET", path, { params }),

  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body }),

  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, { body }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, { body }),

  delete: <T = void>(path: string) => request<T>("DELETE", path),
};
