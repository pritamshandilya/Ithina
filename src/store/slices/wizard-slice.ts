import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage, StagedSku, WizardConstraints } from "@/types/wizard";

type InputMode = "ai" | "csv";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

interface WizardState {
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
      state.gridData = action.payload;
    },
    appendGridRow(state, action: PayloadAction<StagedSku>) {
      state.gridData.push(action.payload);
    },
    removeGridRow(state, action: PayloadAction<string>) {
      state.gridData = state.gridData.filter((r) => r.sku !== action.payload);
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
    resetWizard() {
      return initialState;
    },
  },
});

export const {
  setHasSplit,
  setShowGrid,
  pushMessage,
  setGridData,
  appendGridRow,
  removeGridRow,
  setConstraints,
  setInputMode,
  setCsvRows,
  setCsvFileName,
  setCsvConfirmed,
  setCampaignNamed,
  removeCsvRow,
  removeAllCsvViolations,
  resetWizard,
} = wizardSlice.actions;

export default wizardSlice.reducer;
