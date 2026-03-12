import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface CampaignState {
  active: boolean;
  name: string;
  pendingApproval: boolean;
  publishedAt: number | null;
  skus: Array<{
    sku: string;
    name: string;
    current: string;
    proposed: string;
    safe: boolean;
    margin?: string;
  }>;
}

const initialState: CampaignState = {
  active: false,
  name: "",
  pendingApproval: false,
  publishedAt: null,
  skus: [],
};

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    activateCampaign(state, action: PayloadAction<string>) {
      state.active = true;
      state.name = action.payload;
    },
    deactivateCampaign() {
      return initialState;
    },
    setCampaignName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    setPendingApproval(state, action: PayloadAction<boolean>) {
      state.pendingApproval = action.payload;
    },
    setPublishedAt(state, action: PayloadAction<number | null>) {
      state.publishedAt = action.payload;
      state.pendingApproval = false;
    },
    setStagedSkus(state, action: PayloadAction<CampaignState["skus"]>) {
      state.skus = action.payload;
    },
  },
});

export const {
  activateCampaign,
  deactivateCampaign,
  setCampaignName,
  setPendingApproval,
  setPublishedAt,
  setStagedSkus,
} = campaignSlice.actions;

export default campaignSlice.reducer;
