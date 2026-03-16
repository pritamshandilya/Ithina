import type { RootState } from "@/store";
import type { Store } from "@/providers/store/types";
import type { Shelf } from "@/types/maker";
import type { PlanogramShelfPreview } from "@/queries/maker";

export const selectSelectedStore = (state: RootState): Store | null =>
  state.storeContext?.selectedStore ?? null;

export const selectShelves = (state: RootState): Shelf[] =>
  state.shelves?.items ?? [];

export const selectShelvesLoading = (state: RootState): boolean =>
  state.shelves?.isLoading ?? false;

export const selectPlanogramPreview = (
  state: RootState,
): PlanogramShelfPreview | null => state.planogramPreview?.data ?? null;

export const selectPlanogramPreviewLoading = (
  state: RootState,
): boolean => state.planogramPreview?.isLoading ?? false;

export const selectPlanogramPreviewError = (state: RootState): string | null =>
  state.planogramPreview?.error ?? null;
