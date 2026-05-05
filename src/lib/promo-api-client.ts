/**
 * Axios client targeting the dd_promo_api FastAPI backend.
 *
 * Base URL is set via VITE_PROMO_API_URL in .env (falls back to
 * http://localhost:8000 for local dev).
 *
 * The request interceptor automatically injects the `X-Store-Id` header
 * for every request when an active store has been selected via StoreContext.
 */
import axios, { AxiosHeaders } from "axios";

import { getAuthToken } from "@/lib/auth/session";
import { attachAuthResponseInterceptor } from "@/lib/promo-api/auth-response-interceptor";
import { StoreContext } from "@/lib/store-context";

const BASE_URL = import.meta.env.VITE_PROMO_API_URL ?? "https://backend.promo.creativebits.tech";

export const promoApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

promoApiClient.interceptors.request.use((config) => {
  // Default `Content-Type: application/json` breaks multipart uploads: FormData is
  // JSON-serialized to `{"file":{}}` and FastAPI never receives the file field.
  if (config.data instanceof FormData) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.delete("Content-Type");
    } else {
      const h = config.headers as Record<string, unknown>;
      delete h["Content-Type"];
      delete h["content-type"];
    }
  }

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const requestUrl = config.url ?? "";
  const isAuthRequest =
    requestUrl.startsWith("/api/v1/auth") ||
    requestUrl.includes("/api/v1/auth/");

  // Auth endpoints do not require store scope.
  if (isAuthRequest) {
    return config;
  }

  const storeId = StoreContext.getStoreId();
  if (storeId) {
    config.headers["X-Store-Id"] = storeId;
  }
  return config;
});

attachAuthResponseInterceptor(promoApiClient);
