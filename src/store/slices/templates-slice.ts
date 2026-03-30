import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface TmEditFields {
  headerText: string;
  headerBg: string;
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
  lcdBg: string;
  layout: string;
}

// Minimal serialisable snapshot of the template being edited
export interface TmEditTemplate {
  id: string;
  name: string;
  hw: string;
  hwLabel: string;
  headerText: string;
  headerBg: string;
  productLine: string | null;
}

interface TemplatesState {
  search: string;
  activeHw: string;
  editTemplate: TmEditTemplate | null;
  editFields: TmEditFields;
}

const DEFAULT_EDIT_FIELDS: TmEditFields = {
  headerText: "SALE",
  headerBg: "bg-red-600",
  headerHex: "#FF0000",
  headerFontSize: 24,
  productName: "Product Name",
  nameFontSize: 14,
  nameColor: "#000000",
  price: "$10.99",
  priceFontSize: 48,
  priceColor: "#000000",
  showWas: false,
  wasPrice: "",
  lcdBg: "#1e293b",
  layout: "price-right",
};

const initialState: TemplatesState = {
  search: "",
  activeHw: "all",
  editTemplate: null,
  editFields: DEFAULT_EDIT_FIELDS,
};

const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTmSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setTmActiveHw(state, action: PayloadAction<string>) {
      state.activeHw = action.payload;
    },
    openTmEdit(
      state,
      action: PayloadAction<{ template: TmEditTemplate; fields: TmEditFields }>,
    ) {
      state.editTemplate = action.payload.template;
      state.editFields = action.payload.fields;
    },
    closeTmEdit(state) {
      state.editTemplate = null;
    },
    setTmEditField(
      state,
      action: PayloadAction<{ key: keyof TmEditFields; value: TmEditFields[keyof TmEditFields] }>,
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state.editFields as any)[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  setTmSearch,
  setTmActiveHw,
  openTmEdit,
  closeTmEdit,
  setTmEditField,
} = templatesSlice.actions;

export default templatesSlice.reducer;
