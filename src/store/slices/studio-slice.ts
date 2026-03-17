import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, HardwareDeviceId } from "@/types/wizard";
import type { StudioState } from "@/types/studio";

interface StudioSliceState {
  state: StudioState;
  activeHw: HardwareDeviceId;
  messages: ChatMessage[];
  einkHeaderClass: string;
  einkHeaderText: string;
  eink29ProductText: string;
  eink29PriceText: string;
  lcdBgUrl: string;
}

const initialState: StudioSliceState = {
  state: "choose",
  activeHw: "chroma42",
  messages: [],
  einkHeaderClass: "h-16 text-2xl",
  einkHeaderText: "EXPIRING IN 48H",
  eink29ProductText: "Premium Salmon",
  eink29PriceText: "$10.39",
  lcdBgUrl: "url('https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80')",
};

const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    setStudioState(state, action: PayloadAction<StudioState>) {
      state.state = action.payload;
    },
    setActiveHw(state, action: PayloadAction<HardwareDeviceId>) {
      state.activeHw = action.payload;
    },
    pushStudioMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setStudioMessages(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    setEinkHeaderClass(state, action: PayloadAction<string>) {
      state.einkHeaderClass = action.payload;
    },
    setEinkHeaderText(state, action: PayloadAction<string>) {
      state.einkHeaderText = action.payload;
    },
    setEink29ProductText(state, action: PayloadAction<string>) {
      state.eink29ProductText = action.payload;
    },
    setEink29PriceText(state, action: PayloadAction<string>) {
      state.eink29PriceText = action.payload;
    },
    setLcdBgUrl(state, action: PayloadAction<string>) {
      state.lcdBgUrl = action.payload;
    },
    resetStudio() {
      return initialState;
    },
  },
});

export const {
  setStudioState,
  setActiveHw,
  pushStudioMessage,
  setStudioMessages,
  setEinkHeaderClass,
  setEinkHeaderText,
  setEink29ProductText,
  setEink29PriceText,
  setLcdBgUrl,
  resetStudio,
} = studioSlice.actions;

export default studioSlice.reducer;
