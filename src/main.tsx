import "./bootstrap";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import { Provider as ReduxProvider } from "react-redux";

import App from "./App";
import { StoreProvider } from "./providers/store";
import { queryClient } from "./queries/client";
import store, { persistor } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <StoreProvider>
            <App />
          </StoreProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  </StrictMode>,
);
