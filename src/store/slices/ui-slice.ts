import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
}

const initialState: UiState = {
  isDarkMode: true,
  isSidebarCollapsed: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    toggleSidebar(state) {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
  },
});

export const { toggleTheme, toggleSidebar } = uiSlice.actions;

export default uiSlice.reducer;
