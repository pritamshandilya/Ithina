import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ApiCampaignCSVDiscoverResponse } from "@/types/api/campaigns";
import type { ChatMessage, StagedSku, WizardConstraints } from "@/types/wizard";
import {
  DEFAULT_LANGUAGE_CODE,
  isLanguageCode,
  type LanguageCode,
} from "../../features/wizard/lib/promo-languages";

type InputMode = "ai" | "csv";
export type WizardMode = "nl" | "manual";

const PROMO_ASSISTANT_LANGUAGE_STORAGE_KEY = "promo_assistant_lang";

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
  /** Non-null after successful /campaigns/upload/discover — drives mapping modal. */
  csvDiscoverResponse: ApiCampaignCSVDiscoverResponse | null;
  /** User-editable column mapping (system field → CSV header). */
  csvMapping: Record<string, string>;
  /** Full file rows keyed by API discover headers — edited in mapping modal, re-uploaded on confirm. */
  csvParsedRows: Record<string, string>[] | null;
  csvConfirmed: boolean;
  campaignNamed: boolean;
  /** Language the Promo Assistant AI should reply in (prepended to outgoing prompts). */
  promoAssistantLanguage: LanguageCode;
}

/** Read persisted language from localStorage (safe on SSR / missing window). */
function readPersistedLanguage(): LanguageCode {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE_CODE;
  try {
    const raw = window.localStorage.getItem(PROMO_ASSISTANT_LANGUAGE_STORAGE_KEY);
    return isLanguageCode(raw) ? raw : DEFAULT_LANGUAGE_CODE;
  } catch {
    return DEFAULT_LANGUAGE_CODE;
  }
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
  csvDiscoverResponse: null,
  csvMapping: {},
  csvParsedRows: null,
  csvConfirmed: false,
  campaignNamed: false,
  promoAssistantLanguage: readPersistedLanguage(),
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
    loadChatHistory(state, action: PayloadAction<ChatMessage[]>) {
      state.messages = action.payload;
    },
    setGridData(state, action: PayloadAction<StagedSku[]>) {
      const rows = action.payload;
      if (!Array.isArray(rows)) return;
      state.gridData = rows.map((r) => ({
        ...r,
        included: r.included !== false,
      }));
    },
    mergeGridData(state, action: PayloadAction<StagedSku[]>) {
      const incoming = action.payload;
      if (!Array.isArray(incoming) || incoming.length === 0) return;

      const existingByKey = new Map(
        state.gridData.map((r) => [r.sku, r]),
      );

      state.gridData = incoming.map((r) => {
        const prev = existingByKey.get(r.sku);
        return {
          ...r,
          /** New draft turn always wins for pricing; only preserve user include/exclude toggles. */
          included: prev ? prev.included : r.included !== false,
          eslId: r.eslId ?? prev?.eslId,
          rankingScore: r.rankingScore ?? prev?.rankingScore,
          agentSuggestSchedule: r.agentSuggestSchedule ?? prev?.agentSuggestSchedule,
          offerType: r.offerType ?? prev?.offerType,
          offerLabel: r.offerLabel ?? prev?.offerLabel,
          stockQty: r.stockQty ?? prev?.stockQty,
          isFree: r.isFree ?? prev?.isFree ?? false,
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
      const marginPctRaw =
        row.proposed > 0 && baseCost > 0 ? ((row.proposed - baseCost) / row.proposed) * 100 : 0;
      const marginPctRounded = Math.round(marginPctRaw * 10) / 10;
      const marginText = Number.isInteger(marginPctRounded)
        ? String(marginPctRounded)
        : marginPctRounded.toFixed(1);
      row.margin = `${marginText}%`;
      row.marginPct = marginPctRounded;

      const marginFloor = parseFloat(state.constraints.marginFloor) || 15;
      row.safe = marginPctRaw >= marginFloor;

      const csvRow = state.csvRows.find((r) => r.sku === sku);
      if (csvRow) {
        csvRow.current = row.current.toFixed(2);
        csvRow.proposed = row.proposed.toFixed(2);
        csvRow.safe = row.safe;
      }
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
    setCsvDiscoverResponse(
      state,
      action: PayloadAction<ApiCampaignCSVDiscoverResponse | null>,
    ) {
      state.csvDiscoverResponse = action.payload;
    },
    setCsvMapping(state, action: PayloadAction<Record<string, string>>) {
      state.csvMapping = action.payload;
    },
    setCsvParsedRows(state, action: PayloadAction<Record<string, string>[] | null>) {
      state.csvParsedRows = action.payload;
    },
    updateCsvParsedCell(
      state,
      action: PayloadAction<{ rowIndex: number; columnKey: string; value: string }>,
    ) {
      const { rowIndex, columnKey, value } = action.payload;
      const rows = state.csvParsedRows;
      if (!rows || rowIndex < 0 || rowIndex >= rows.length) return;
      const copy = { ...rows[rowIndex], [columnKey]: value };
      state.csvParsedRows = rows.map((r, i) => (i === rowIndex ? copy : r));
    },
    removeCsvParsedRow(state, action: PayloadAction<number>) {
      const idx = action.payload;
      const rows = state.csvParsedRows;
      if (!rows || idx < 0 || idx >= rows.length) return;
      state.csvParsedRows = rows.filter((_, i) => i !== idx);
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
      state.gridData = state.gridData.filter((r) => r.safe);
    },
    /** Clears NL promo chat + staged SKUs while staying on the same wizard step. */
    resetPromoAssistantChat(state) {
      state.messages = [];
      state.gridData = [];
      state.campaignNamed = false;
    },
    /** Clears chat bubbles only (keeps grid) when navigating between wizard steps. */
    clearChatMessagesForStepChange(state) {
      state.messages = [];
    },
    setPromoAssistantLanguage(state, action: PayloadAction<LanguageCode>) {
      state.promoAssistantLanguage = action.payload;
    },
    resetWizard(state) {
      return { ...initialState, promoAssistantLanguage: state.promoAssistantLanguage };
    },
  },
});

export const {
  setWMode,
  setWStep,
  setHasSplit,
  setShowGrid,
  pushMessage,
  loadChatHistory,
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
  setCsvDiscoverResponse,
  setCsvMapping,
  setCsvParsedRows,
  updateCsvParsedCell,
  removeCsvParsedRow,
  setCsvConfirmed,
  setCampaignNamed,
  removeCsvRow,
  removeAllCsvViolations,
  resetPromoAssistantChat,
  clearChatMessagesForStepChange,
  setPromoAssistantLanguage,
  resetWizard,
} = wizardSlice.actions;

export { PROMO_ASSISTANT_LANGUAGE_STORAGE_KEY };

export default wizardSlice.reducer;
