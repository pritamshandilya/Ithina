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
 *  import { apiClient } from "@/query/api-client";
 *  const data = await apiClient.get<UserResponse>("/users/me");
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Structured API error with HTTP status code.
 * Used by the query client's `shouldRetry` logic.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly data?: unknown;

  constructor(
    status: number,
    statusText: string,
    message: string,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
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

  // Attach auth token when available (JWT stored in memory by auth provider)
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
  },
): Promise<T> {
  let url = `${BASE_URL}${path}`;

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

  const res = await fetch(url, {
    method,
    headers: buildHeaders(options?.headers),
    body:
      options?.body instanceof URLSearchParams
        ? options.body
        : options?.body !== undefined
          ? JSON.stringify(options.body)
          : undefined,
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
