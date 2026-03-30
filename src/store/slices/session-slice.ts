import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { clearAuthSession, clearSelectedStoreId, getSelectedStoreId } from "@/lib/auth/session";
import type { Organization, UserRole } from "@/types/shared-api";

interface SessionUser {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface SessionState {
  isAuthenticated: boolean;
  user: SessionUser | null;
  organization: Organization | null;
  selectedStoreId: string | null;
}

const initialState: SessionState = {
  isAuthenticated: false,
  user: null,
  organization: null,
  selectedStoreId: getSelectedStoreId(),
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setAuthenticatedSession(
      state,
      action: PayloadAction<{
        user: SessionUser;
        organization: Organization;
      }>,
    ) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.organization = action.payload.organization;
    },
    setSelectedStore(state, action: PayloadAction<string>) {
      state.selectedStoreId = action.payload;
    },
    clearSession(state) {
      clearAuthSession();
      clearSelectedStoreId();
      state.isAuthenticated = false;
      state.user = null;
      state.organization = null;
      state.selectedStoreId = null;
    },
  },
});

export const { setAuthenticatedSession, setSelectedStore, clearSession } =
  sessionSlice.actions;

export default sessionSlice.reducer;
