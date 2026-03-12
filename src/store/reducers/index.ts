import { combineReducers } from "@reduxjs/toolkit";
import type { Store } from "@/providers/store/types";

// ---------------------------------------------------------------------------
// Auth slice – token, expiry, user. Persisted to sessionStorage.
// ---------------------------------------------------------------------------
export interface AuthState {
  token: string | null;
  tokenExpiry: number | null;
  user: unknown; // AuthSessionUser | null; typed in session.ts to avoid circular deps
}

const initialAuthState: AuthState = {
  token: null,
  tokenExpiry: null,
  user: null,
};

export function authReducer(
  state: AuthState = initialAuthState,
  action: { type: string; payload?: unknown },
): AuthState {
  switch (action.type) {
    case "auth/setSession": {
      const p = action.payload as Partial<AuthState> | undefined;
      if (!p) return state;
      return {
        ...state,
        ...(p.token !== undefined && { token: p.token }),
        ...(p.tokenExpiry !== undefined && { tokenExpiry: p.tokenExpiry }),
        ...(p.user !== undefined && { user: p.user }),
      };
    }
    case "auth/clearSession":
      return initialAuthState;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Store context slice – selected store. Persisted to localStorage.
// ---------------------------------------------------------------------------
export interface StoreContextState {
  selectedStore: Store | null;
}

const initialStoreContextState: StoreContextState = {
  selectedStore: null,
};

export function storeContextReducer(
  state: StoreContextState = initialStoreContextState,
  action: { type: string; payload?: unknown },
): StoreContextState {
  switch (action.type) {
    case "store/setCurrentStore": {
      const payload = action.payload as Store | null | undefined;
      return { ...state, selectedStore: payload ?? null };
    }
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// UI slice – sidebar, etc. Persisted to localStorage.
// ---------------------------------------------------------------------------
export interface UiState {
  sidebarOpen: boolean;
}

const initialUiState: UiState = {
  sidebarOpen: true,
};

export function uiReducer(
  state: UiState = initialUiState,
  action: { type: string; payload?: unknown },
): UiState {
  switch (action.type) {
    case "ui/setSidebarOpen":
      return { ...state, sidebarOpen: Boolean(action.payload) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Profile slice – local profile overrides (firstName, lastName, avatar). Persisted to localStorage.
// ---------------------------------------------------------------------------
export interface ProfileState {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

const initialProfileState: ProfileState = {};

export function profileReducer(
  state: ProfileState = initialProfileState,
  action: { type: string; payload?: unknown },
): ProfileState {
  switch (action.type) {
    case "profile/setProfile":
      return { ...state, ...(action.payload as Partial<ProfileState>) };
    case "profile/clearProfile":
      return initialProfileState;
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Root reducer (non-persisted; persist is applied in store/index)
// ---------------------------------------------------------------------------
export const rootReducer = combineReducers({
  auth: authReducer,
  storeContext: storeContextReducer,
  ui: uiReducer,
  profile: profileReducer,
});
