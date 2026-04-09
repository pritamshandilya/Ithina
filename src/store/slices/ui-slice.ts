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
  reducers: {},
});

export default uiSlice.reducer;
