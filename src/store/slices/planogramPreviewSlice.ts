import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { getShelfById } from "@/queries/maker/api/maker";
import { fetchPlanogramById } from "@/queries/maker/api/planogram";
import type { PlanogramShelfPreview } from "@/queries/maker";

export interface PlanogramPreviewState {
  currentShelfId: string | null;
  data: PlanogramShelfPreview | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PlanogramPreviewState = {
  currentShelfId: null,
  data: null,
  isLoading: false,
  error: null,
};

export const fetchPlanogramShelfPreview = createAsyncThunk<
  PlanogramShelfPreview | null,
  string
>("planogramPreview/fetchPlanogramShelfPreview", async (shelfId) => {
  const shelf = await getShelfById(shelfId);
  if (!shelf) return null;
  if (!shelf.planogramId) {
    return { shelf, planogramPayload: null };
  }
  const planogramPayload = await fetchPlanogramById(shelf.planogramId);
  if (!planogramPayload) {
    return { shelf, planogramPayload: null };
  }
  return { shelf, planogramPayload };
});

const planogramPreviewSlice = createSlice({
  name: "planogramPreview",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlanogramShelfPreview.pending, (state, action) => {
        state.currentShelfId = action.meta.arg;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanogramShelfPreview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPlanogramShelfPreview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load planogram preview";
      });
  },
});

export const planogramPreviewReducer = planogramPreviewSlice.reducer;

