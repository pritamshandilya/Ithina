import "./bootstrap";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import store from "./store";
import { AuthProvider } from "@/providers/auth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider
        serverUrl={import.meta.env.VITE_AUTH_SERVER_URL ?? window.location.origin}
        redirectUri={import.meta.env.VITE_AUTH_REDIRECT_URI ?? window.location.origin}
        shouldAutoFetchUserInfo={false}
        shouldAutoRefresh={false}
      >
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
);
