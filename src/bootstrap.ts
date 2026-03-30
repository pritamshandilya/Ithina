import "./index.css";

import axios from "axios";

import { SimulatedAuthService } from "./lib/auth/simulated-auth";

axios.defaults.baseURL = import.meta.env.VITE_N8N_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const user = SimulatedAuthService.getCurrentUser();
    if (user?.id) {
      config.headers["X-ID"] = user.id;
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

axios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);
