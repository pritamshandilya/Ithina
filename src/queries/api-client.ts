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
import { AuthSessionService } from "@/lib/auth/session";

export { ApiError };

const API_V1_PREFIX = "/api/v1";

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
    const error = new ApiError(res.status, res.statusText, message, data);
    if (error.status === 401) {
      // Clear session and force redirect to login on invalid/expired token
      AuthSessionService.logout();
      window.dispatchEvent(
        new CustomEvent("app:session-expired", {
          detail: { message: "Session expired. Please log in again." },
        }),
      );
    }
    throw error;
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function buildHeaders(extra?: HeadersInit): HeadersInit {
  const baseExtras = extra ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(baseExtras as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const hasExplicitStoreHeader = Object.keys(baseExtras).some(
    (key) => key.toLowerCase() === "x-store-id",
  );
  const storeId = getSelectedStoreId();
  if (storeId && !hasExplicitStoreHeader) {
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
  const { baseUrl } = getHttpConfig();

  const normalizedPath = (() => {
    if (/^https?:\/\//i.test(path)) return path;

    const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
    if (withLeadingSlash === API_V1_PREFIX || withLeadingSlash.startsWith(`${API_V1_PREFIX}/`)) {
      return withLeadingSlash;
    }

    const baseHasV1Prefix = /\/api\/v1\/?$/i.test(baseUrl);
    if (baseHasV1Prefix) return withLeadingSlash;

    return `${API_V1_PREFIX}${withLeadingSlash}`;
  })();

  let url = /^https?:\/\//i.test(normalizedPath)
    ? normalizedPath
    : `${baseUrl}${normalizedPath}`;

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

export interface RequestOptions {
  headers?: HeadersInit;
}

export const apiClient = {
  get: <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options?: RequestOptions,
  ) => request<T>("GET", path, { params, ...options }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, { body, ...options }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, { body, ...options }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, { body, ...options }),

  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, options),
};
