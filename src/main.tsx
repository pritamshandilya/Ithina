import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import store from "./store";
import type { AuthConfig } from "@/config/auth";
import { AuthProvider } from "@/providers/auth";

const authConfig: AuthConfig = {
  serverUrl: import.meta.env.VITE_AUTH_SERVER_URL,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider {...authConfig}>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
