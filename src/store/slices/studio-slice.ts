import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, HardwareDeviceId } from "@/types/wizard";
import type { StudioState } from "@/types/studio";

export interface StudioEditFields {
  headerText: string;
  headerHex: string;
  headerFontSize: number;
  productName: string;
  nameFontSize: number;
  nameColor: string;
  price: string;
  priceFontSize: number;
  priceColor: string;
  showWas: boolean;
  wasPrice: string;
  layout: string;
  lcdBg: string;
}

interface StudioSliceState {
  state: StudioState;
  activeHw: HardwareDeviceId;
  messages: ChatMessage[];
  sidebarTab: "compliance" | "edit";
  editFields: StudioEditFields;
  einkHeaderClass: string;
  einkHeaderText: string;
  einkHeaderBg: string;
  einkProductText: string;
  einkPriceText: string;
  einkProductFontSize: number;
  einkProductColor: string;
  einkPriceFontSize: number;
  einkPriceColor: string;
  einkLayout: string;
  eink29ProductText: string;
  eink29PriceText: string;
  lcdBgUrl: string;
}

const initialState: StudioSliceState = {
  state: "choose",
  activeHw: "chroma42",
  messages: [],
  sidebarTab: "compliance",
  editFields: {
    headerText: "TODAY ONLY",
    headerHex: "#FF0000",
    headerFontSize: 24,
    productName: "Premium Salmon Tray",
    nameFontSize: 14,
    nameColor: "#000000",
    price: "$10.39",
    priceFontSize: 48,
    priceColor: "#000000",
    showWas: true,
    wasPrice: "$12.99",
    layout: "price-right",
    lcdBg: "#111827",
  },
  einkHeaderClass: "h-16 text-2xl",
  einkHeaderText: "EXPIRING IN 48H",
  einkHeaderBg: "#FF0000",
  einkProductText: "Premium Salmon Tray",
  einkPriceText: "$10.39",
  einkProductFontSize: 24,
  einkProductColor: "#000000",
  einkPriceFontSize: 70,
  einkPriceColor: "#000000",
  einkLayout: "price-right",
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
    setSidebarTab(state, action: PayloadAction<"compliance" | "edit">) {
      state.sidebarTab = action.payload;
    },
    setEditFields(state, action: PayloadAction<Partial<StudioEditFields>>) {
      state.editFields = { ...state.editFields, ...action.payload };
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
    setEinkHeaderBg(state, action: PayloadAction<string>) {
      state.einkHeaderBg = action.payload;
    },
    setEinkProductText(state, action: PayloadAction<string>) {
      state.einkProductText = action.payload;
    },
    setEinkPriceText(state, action: PayloadAction<string>) {
      state.einkPriceText = action.payload;
    },
    setEinkProductFontSize(state, action: PayloadAction<number>) {
      state.einkProductFontSize = action.payload;
    },
    setEinkProductColor(state, action: PayloadAction<string>) {
      state.einkProductColor = action.payload;
    },
    setEinkPriceFontSize(state, action: PayloadAction<number>) {
      state.einkPriceFontSize = action.payload;
    },
    setEinkPriceColor(state, action: PayloadAction<string>) {
      state.einkPriceColor = action.payload;
    },
    setEinkLayout(state, action: PayloadAction<string>) {
      state.einkLayout = action.payload;
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
  setSidebarTab,
  setEditFields,
  pushStudioMessage,
  setStudioMessages,
  setEinkHeaderClass,
  setEinkHeaderText,
  setEinkHeaderBg,
  setEinkProductText,
  setEinkPriceText,
  setEinkProductFontSize,
  setEinkProductColor,
  setEinkPriceFontSize,
  setEinkPriceColor,
  setEinkLayout,
  setEink29ProductText,
  setEink29PriceText,
  setLcdBgUrl,
  resetStudio,
} = studioSlice.actions;

export default studioSlice.reducer;
