import { createSlice } from "@reduxjs/toolkit";

interface UiState {
  isDarkMode: boolean;
}

const initialState: UiState = {
  isDarkMode: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDarkMode = !state.isDarkMode;
    },
  },
});

export const { toggleTheme } = uiSlice.actions;

export default uiSlice.reducer;
