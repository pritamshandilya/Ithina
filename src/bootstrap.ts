import "./index.css";

import axios from "axios";

import { getAuthToken, getSelectedStoreId } from "./lib/auth/session";

axios.defaults.baseURL = import.meta.env.VITE_N8N_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    const storeId = getSelectedStoreId();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (storeId) {
      config.headers["X-Store-Id"] = storeId;
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);
