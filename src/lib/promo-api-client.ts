/**
 * Axios client targeting the dd_promo_api FastAPI backend.
 *
 * Base URL is set via VITE_PROMO_API_URL in .env (falls back to
 * http://localhost:8000 for local dev).
 *
 * The request interceptor automatically injects the `X-Store-Id` header
 * for every request when an active store has been selected via StoreContext.
 */
import axios from "axios";
import { StoreContext } from "@/lib/store-context";

const BASE_URL = import.meta.env.VITE_PROMO_API_URL ?? "http://localhost:8000";

export const promoApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

promoApiClient.interceptors.request.use((config) => {
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
