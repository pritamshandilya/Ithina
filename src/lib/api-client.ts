import axios from "axios";

import { getAuthToken } from "./auth/session";

const BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_CORE_API_URL?: string } }).env
    ?.VITE_CORE_API_URL ?? "https://backend.promo.creativebits.tech";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
