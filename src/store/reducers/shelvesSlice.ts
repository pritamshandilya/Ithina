import {
  type PayloadAction,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";

import { updateShelfArrangement } from "@/lib/api/maker/planogram";
import {
  listShelves,
  mapShelfResponseToShelf,
} from "@/lib/api/maker/shelves";
import type { Shelf } from "@/types/maker";
import type { PlanogramArrangement } from "@/types/planogram";

export interface ShelvesState {
  items: Shelf[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShelvesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchShelves = createAsyncThunk<
  Shelf[],
  { fixtureId?: string } | undefined
>("shelves/fetchShelves", async (params, _thunkApi) => {
  const responses = await listShelves(params?.fixtureId);
  return responses.map(mapShelfResponseToShelf);
});

export const updateShelfArrangementThunk = createAsyncThunk<
  Shelf | null,
  { shelfId: string; arrangement: PlanogramArrangement }
>("shelves/updateShelfArrangement", async ({ shelfId, arrangement }) => {
  return updateShelfArrangement(shelfId, arrangement);
});

const shelvesSlice = createSlice({
  name: "shelves",
  initialState,
  reducers: {
    upsertShelf(state, action: PayloadAction<Shelf>) {
      const idx = state.items.findIndex((s) => s.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShelves.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShelves.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchShelves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load shelves";
      })
      .addCase(updateShelfArrangementThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.items.findIndex((s) => s.id === updated.id);
        if (idx >= 0) {
          state.items[idx] = { ...state.items[idx], ...updated };
        } else {
          state.items.push(updated);
        }
      });
  },
});

export const { upsertShelf } = shelvesSlice.actions;
export const shelvesReducer = shelvesSlice.reducer;
