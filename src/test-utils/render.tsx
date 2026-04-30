import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";

import { AuthContext, defaultContext, type AuthProviderContext } from "@/providers/auth";
import type { RootState } from "@/store";
import campaignReducer from "@/store/slices/campaign-slice";
import studioReducer from "@/store/slices/studio-slice";
import templatesReducer from "@/store/slices/templates-slice";
import uiReducer from "@/store/slices/ui-slice";
import wizardReducer from "@/store/slices/wizard-slice";

const rootReducer = combineReducers({
  ui: uiReducer,
  campaign: campaignReducer,
  wizard: wizardReducer,
  studio: studioReducer,
  templates: templatesReducer,
});

export type TestStore = ReturnType<typeof createTestStore>;

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { gcTime: 0, retry: false },
    },
  });
}

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  auth?: Partial<AuthProviderContext>;
  queryClient?: QueryClient;
  preloadedState?: Partial<RootState>;
  store?: TestStore;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    auth,
    queryClient = createTestQueryClient(),
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const authValue: AuthProviderContext = { ...defaultContext, ...auth };

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    queryClient,
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export * from "@testing-library/react";
