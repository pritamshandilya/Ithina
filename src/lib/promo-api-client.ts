/**
 * Axios client targeting the dd_promo_api FastAPI backend.
 *
 * Base URL is set via VITE_PROMO_API_URL in .env (falls back to
 * http://localhost:8000 for local dev).
 *
 * When running through the Vite dev server the proxy in vite.config.ts
 * rewrites /api → n8n, so the promo backend uses its own base URL
 * instead of the /api prefix.
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_PROMO_API_URL ?? "http://localhost:8000";

export const promoApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
