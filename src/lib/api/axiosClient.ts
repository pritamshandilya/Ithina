import axios from "axios";

import { ApiError } from "@/exceptions/ApiError";
import { getHttpConfig } from "@/lib/api/config";
import { AuthSessionService } from "@/lib/auth/session";
import store from "@/store";
import { selectSelectedStore } from "@/store/selectors";

const API_V1_PREFIX = "/api/v1";

export const axiosClient = axios.create({
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const { baseUrl } = getHttpConfig();

    if (config.url && !/^https?:\/\//i.test(config.url)) {
      const withLeadingSlash = config.url.startsWith("/")
        ? config.url
        : `/${config.url}`;

      let normalizedPath = withLeadingSlash;

      const hasV1Prefix =
        withLeadingSlash === API_V1_PREFIX ||
        withLeadingSlash.startsWith(`${API_V1_PREFIX}/`);

      if (!hasV1Prefix) {
        const baseHasV1Prefix = /\/api\/v1\/?$/i.test(baseUrl);
        if (!baseHasV1Prefix) {
          normalizedPath = `${API_V1_PREFIX}${withLeadingSlash}`;
        }
      }

      config.baseURL = baseUrl;
      config.url = normalizedPath;
    }

    // Inject Bearer token
    const state = store.getState();
    const token = state.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject X-Store-Id
    const storeId = selectSelectedStore(state)?.id;
    if (storeId && !config.headers["X-Store-Id"]) {
      config.headers["X-Store-Id"] = storeId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const res = error.response;
      const data = res.data;

      const message =
        data && typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : data &&
              typeof data === "object" &&
              data !== null &&
              "detail" in data
            ? String((data as { detail: unknown }).detail)
            : res.statusText || "An unexpected error occurred";

      const apiError = new ApiError(res.status, res.statusText, message, data);

      if (apiError.status === 401) {
        AuthSessionService.logout();
        window.dispatchEvent(
          new CustomEvent("app:session-expired", {
            detail: { message: "Session expired. Please log in again." },
          }),
        );
      }
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  },
);
