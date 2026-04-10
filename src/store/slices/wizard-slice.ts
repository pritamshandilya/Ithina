import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, StagedSku, WizardConstraints } from "@/types/wizard";

type InputMode = "ai" | "csv";
export type WizardMode = "nl" | "manual";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

interface WizardState {
  wMode: WizardMode | "";
  wStep: number;
  hasSplit: boolean;
  showGrid: boolean;
  messages: ChatMessage[];
  gridData: StagedSku[];
  constraints: WizardConstraints;
  inputMode: InputMode;
  csvRows: CsvRow[];
  csvFileName: string;
  csvConfirmed: boolean;
  campaignNamed: boolean;
}

const initialState: WizardState = {
  wMode: "",
  wStep: 0,
  hasSplit: false,
  showGrid: false,
  messages: [],
  gridData: [],
  constraints: {
    store: "4281",
    marginFloor: "15%",
    duration: "weekend",
  },
  inputMode: "ai",
  csvRows: [],
  csvFileName: "",
  csvConfirmed: false,
  campaignNamed: false,
};

const wizardSlice = createSlice({
  name: "wizard",
  initialState,
  reducers: {
    setWMode(state, action: PayloadAction<WizardMode | "">) {
      state.wMode = action.payload;
    },
    setWStep(state, action: PayloadAction<number>) {
      state.wStep = action.payload;
    },
    setHasSplit(state, action: PayloadAction<boolean>) {
      state.hasSplit = action.payload;
    },
    setShowGrid(state, action: PayloadAction<boolean>) {
      state.showGrid = action.payload;
    },
    pushMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    setGridData(state, action: PayloadAction<StagedSku[]>) {
      state.gridData = action.payload.map((r) => ({
        ...r,
        included: r.included !== false,
      }));
    },
    mergeGridData(state, action: PayloadAction<StagedSku[]>) {
      const incoming = action.payload;
      if (incoming.length === 0) return;

      const existingByKey = new Map(
        state.gridData.map((r) => [r.sku, r]),
      );

      state.gridData = incoming.map((r) => {
        const prev = existingByKey.get(r.sku);
        return {
          ...r,
          /** New draft turn always wins for pricing; only preserve user include/exclude toggles. */
          included: prev ? prev.included : r.included !== false,
        };
      });
    },
    appendGridRow(state, action: PayloadAction<StagedSku>) {
      const row = action.payload;
      state.gridData.push({
        ...row,
        included: row.included !== false,
      });
    },
    removeGridRow(state, action: PayloadAction<string>) {
      state.gridData = state.gridData.filter((r) => r.sku !== action.payload);
    },
    toggleGridRowIncluded(state, action: PayloadAction<string>) {
      const sku = action.payload;
      const row = state.gridData.find((r) => r.sku === sku);
      if (!row) return;
      const currentlyIncluded = row.included !== false;
      row.included = !currentlyIncluded;
    },
    setAllGridRowsIncluded(state, action: PayloadAction<boolean>) {
      const next = action.payload;
      for (const row of state.gridData) {
        row.included = next;
      }
    },
    updateGridRowDiscount(state, action: PayloadAction<{ sku: string; discount: number }>) {
      const { sku, discount } = action.payload;
      const row = state.gridData.find((r) => r.sku === sku);
      if (!row) return;

      const clamped = Math.max(0, Math.min(100, discount));
      row.discount = clamped;
      row.proposed = +(row.current * (1 - clamped / 100)).toFixed(2);

      const baseCost = row.baseCost ?? 0;
      const marginPct = row.proposed > 0 && baseCost > 0
        ? ((row.proposed - baseCost) / row.proposed) * 100
        : 0;
      row.margin = `${Math.round(marginPct)}%`;

      const marginFloor = parseFloat(state.constraints.marginFloor) || 15;
      row.safe = marginPct >= marginFloor;
    },
    setConstraints(state, action: PayloadAction<WizardConstraints>) {
      state.constraints = action.payload;
    },
    setInputMode(state, action: PayloadAction<InputMode>) {
      state.inputMode = action.payload;
      if (action.payload === "csv") {
        state.hasSplit = true;
        state.showGrid = true;
      }
    },
    setCsvRows(state, action: PayloadAction<CsvRow[]>) {
      state.csvRows = action.payload;
    },
    setCsvFileName(state, action: PayloadAction<string>) {
      state.csvFileName = action.payload;
    },
    setCsvConfirmed(state, action: PayloadAction<boolean>) {
      state.csvConfirmed = action.payload;
    },
    setCampaignNamed(state, action: PayloadAction<boolean>) {
      state.campaignNamed = action.payload;
    },
    removeCsvRow(state, action: PayloadAction<number>) {
      state.csvRows = state.csvRows.filter((_, i) => i !== action.payload);
    },
    removeAllCsvViolations(state) {
      state.csvRows = state.csvRows.filter((r) => r.safe);
    },
    /** Clears NL promo chat + staged SKUs while staying on the same wizard step. */
    resetPromoAssistantChat(state) {
      state.messages = [];
      state.gridData = [];
      state.campaignNamed = false;
    },
    resetWizard() {
      return initialState;
    },
  },
});

export const {
  setWMode,
  setWStep,
  setHasSplit,
  setShowGrid,
  pushMessage,
  setGridData,
  mergeGridData,
  appendGridRow,
  removeGridRow,
  toggleGridRowIncluded,
  setAllGridRowsIncluded,
  updateGridRowDiscount,
  setConstraints,
  setInputMode,
  setCsvRows,
  setCsvFileName,
  setCsvConfirmed,
  setCampaignNamed,
  removeCsvRow,
  removeAllCsvViolations,
  resetPromoAssistantChat,
  resetWizard,
} = wizardSlice.actions;

export default wizardSlice.reducer;
