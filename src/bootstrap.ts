import "./index.css";

import axios from "axios";

import store from "./store";

/**
 * ============================================================================
 * Axios Configuration
 * ============================================================================
 */

// Set the base URL for all requests
axios.defaults.baseURL = import.meta.env.VITE_N8N_URL;

// Allow cookies to be sent with requests
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const state = store.getState() as Record<string, unknown>;
    const id = (state.profile as { id?: string } | undefined)?.id;

    if (id) {
      // Add the ID to the request headers if it exists
      // Replace "X-ID" with the actual header name you want to use
      config.headers["X-ID"] = id;
    }

    return config;
  },
  (error) => {
    // Handle any errors that occur during the request
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);

axios.interceptors.response.use(
  (response) => {
    // Add any custom logic after the response is received
    return response;
  },
  (error) => {
    // Handle any errors that occur during the response
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error)),
    );
  },
);
