import { AlertTriangle } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activateCampaign, setStagedSkus } from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";
import {
  appendGridRow,
  pushMessage as pushWizardMessage,
  removeAllCsvViolations,
  removeCsvRow,
  removeGridRow,
  resetWizard,
  setCampaignNamed,
  setConstraints as setWizardConstraints,
  setCsvConfirmed,
  setCsvFileName,
  setCsvRows,
  setHasSplit,
  setInputMode as setWizardInputMode,
  setShowGrid,
  setWMode,
  setWStep,
} from "@/store/slices/wizard-slice";
import type { HardwareDeviceId, WizardConstraints } from "@/types/wizard";
import { useScheduledCallback } from "@/hooks/use-scheduled-callback";
import { useConfirmHardwareSelection, useSubmitWizardIntent } from "@/hooks/use-wizard";
import { cn } from "@/lib/utils";

import ChatPanel from "./components/chat-panel";
import ConstraintBar from "./components/constraint-bar";
import DataStagingGrid from "./components/data-staging-grid";
import type { InputMode } from "./components/data-staging-grid";
import ModeChooser from "./components/mode-chooser";
import type { WizardMode } from "./components/mode-chooser";
import ScreenSelector from "./components/screen-selector";
import ManualUpload from "./components/manual-upload";
import WizardStepHeader from "./components/wizard-step-header";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

// Step 0 = mode chooser, steps 1..N = actual steps
// NL:     step 1 = Intent & Data, step 2 = Select Screens
// Manual: step 1 = Select Screens, step 2 = Upload Banners

const NL_STEPS = ["Intent & Data", "Select Screens"];
const MANUAL_STEPS = ["Select Screens", "Upload Banners"];

export default function Wizard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ── Device / upload state (local — not in redux) ───────────────────
  const [selectedDevices, setSelectedDevices] = useState<HardwareDeviceId[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<HardwareDeviceId, string>>>({});

  // ── Redux wizard state ─────────────────────────────────────────────
  const {
    wMode,
    wStep,
    hasSplit,
    showGrid,
    messages,
    gridData,
    constraints,
    inputMode,
    csvRows,
    csvFileName,
    csvConfirmed,
    campaignNamed,
  } = useAppSelector((s) => s.wizard);

  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addTimer = useScheduledCallback();
  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();

  const wSteps = wMode === "nl" ? NL_STEPS : MANUAL_STEPS;

  // ── Navigation helpers ─────────────────────────────────────────────
  const handleSelectMode = useCallback((mode: WizardMode) => {
    dispatch(setWMode(mode));
    dispatch(setWStep(1));
    dispatch(setHasSplit(false));
    dispatch(setShowGrid(false));
  }, [dispatch]);

  const handleBack = useCallback(() => {
    if (wStep <= 1) {
      dispatch(setWMode(""));
      dispatch(setWStep(0));
      dispatch(setHasSplit(false));
      dispatch(setShowGrid(false));
    } else {
      dispatch(setWStep(wStep - 1));
    }
  }, [wStep, dispatch]);

  const handleToggleDevice = useCallback((id: HardwareDeviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  }, []);

  // ── NL flow ────────────────────────────────────────────────────────
  const pushMessage = useCallback(
    (msg: Parameters<typeof pushWizardMessage>[0]) => {
      dispatch(pushWizardMessage(msg));
    },
    [dispatch],
  );

  const generateCampaignName = useCallback(
    (prompt: string) => {
      if (campaignNamed) return;
      const p = (prompt || "").trim();
      const now = new Date();
      const suffix = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      const stop = new Set(["with", "this", "that", "from", "want", "have", "need", "will", "make", "sale", "for", "the", "and", "all", "our", "you", "can", "get"]);
      const meaningful = p.split(/\s+/).filter((w) => w.length >= 4 && !stop.has(w.toLowerCase())).slice(0, 3);
      const base = meaningful.length
        ? meaningful.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")
        : "Promo Campaign";
      dispatch(activateCampaign(`${base} — ${suffix}`));
      dispatch(setCampaignNamed(true));
    },
    [campaignNamed, dispatch],
  );

  const handleSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text || intentMutation.isPending) return;

    if (!hasSplit) dispatch(setHasSplit(true));
    if (!showGrid) dispatch(setShowGrid(true));
    setError(null);

    pushMessage({ role: "user", text });
    setInputText("");
    setIsTyping(true);
    generateCampaignName(text);

    try {
      const { aiReply, skus } = await intentMutation.mutateAsync({ text, constraints });
      setIsTyping(false);
      pushMessage(aiReply);
      if (gridData.length === 0) {
        skus.forEach((item, idx) => {
          addTimer(() => dispatch(appendGridRow(item)), idx * 150);
        });
      }
    } catch {
      setIsTyping(false);
      setError("Failed to process intent. Please try again.");
    }
  }, [inputText, intentMutation, hasSplit, showGrid, constraints, gridData.length, pushMessage, generateCampaignName, dispatch, addTimer]);

  const handleConstraintChange = useCallback(
    (c: WizardConstraints) => dispatch(setWizardConstraints(c)),
    [dispatch],
  );

  // NL Step 2 → trigger studio generation
  const handleNlGenerateLayouts = useCallback(async () => {
    if (selectedDevices.length === 0) return;
    setError(null);

    if (inputMode === "csv" && csvConfirmed) {
      dispatch(setStagedSkus(csvRows));
    }

    try {
      const msg = await hwConfirmMutation.mutateAsync(selectedDevices);
      pushMessage(msg);
      setIsTyping(true);
      addTimer(() => {
        setIsTyping(false);
        dispatch(resetWizard());
        dispatch(resetStudio());
        navigate({ to: "/studio" });
      }, 3000);
    } catch {
      setError("Failed to confirm hardware. Please try again.");
    }
  }, [selectedDevices, hwConfirmMutation, pushMessage, inputMode, csvConfirmed, csvRows, dispatch, addTimer, navigate]);

  // Manual flow confirm
  const handleManualConfirm = useCallback(() => {
    const name = "Manual Upload – " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    dispatch(activateCampaign(name));
    dispatch(resetWizard());
    dispatch(resetStudio());
    navigate({ to: "/studio" });
  }, [dispatch, navigate]);

  // ── CSV handlers ───────────────────────────────────────────────────
  const handleInputModeChange = useCallback(
    (mode: InputMode) => dispatch(setWizardInputMode(mode)),
    [dispatch],
  );
  const handleRemoveGridRow = useCallback(
    (sku: string) => dispatch(removeGridRow(sku)),
    [dispatch],
  );
  const handleCsvParsed = useCallback(
    (rows: CsvRow[], fileName: string) => {
      dispatch(setCsvRows(rows));
      dispatch(setCsvFileName(fileName));
      dispatch(setCsvConfirmed(false));
      dispatch(setHasSplit(true));
      dispatch(setShowGrid(true));
    },
    [dispatch],
  );
  const handleCsvClear = useCallback(() => {
    dispatch(setCsvRows([]));
    dispatch(setCsvFileName(""));
    dispatch(setCsvConfirmed(false));
  }, [dispatch]);
  const handleCsvConfirm = useCallback(() => {
    dispatch(setCsvConfirmed(true));
    dispatch(setStagedSkus(csvRows));
    const warningCount = csvRows.filter((r) => !r.safe).length;
    pushMessage({
      role: "ai",
      text: `${csvRows.length} SKUs loaded from CSV and staged for creative. ${warningCount ? `<span class="text-amber-400">${warningCount} items have low margin — please review.</span>` : "All margin checks passed."}`,
    });
  }, [csvRows, dispatch, pushMessage]);
  const handleRemoveCsvRow = useCallback(
    (idx: number) => dispatch(removeCsvRow(idx)),
    [dispatch],
  );
  const handleRemoveAllViolations = useCallback(() => dispatch(removeAllCsvViolations()), [dispatch]);
  const handleSwitchToCsv = useCallback(() => handleInputModeChange("csv"), [handleInputModeChange]);

  const marginFloor = parseInt(constraints.marginFloor) / 100;

  // ── Proceed button visibility for NL step 1 ────────────────────────
  const canProceedNl = (inputMode === "ai" && showGrid) || (inputMode === "csv" && csvConfirmed);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "New Campaign", isActive: true },
        ]}
        title="Campaign Wizard"
      />

      <div className="relative flex flex-1 flex-col overflow-y-auto">
        {/* Error toast */}
        {error && (
          <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-900/90 px-4 py-2 text-xs text-rose-400 shadow-xl" role="alert">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* ── STEP 0: Mode Chooser ── */}
        {wStep === 0 && (
          <ModeChooser onSelect={handleSelectMode} />
        )}

        {/* ── STEPS 1+: step header + step content ── */}
        {wStep > 0 && wMode !== "" && (
          <div className="flex flex-1 flex-col min-h-0">
            <WizardStepHeader
              mode={wMode}
              currentStep={wStep}
              steps={wSteps}
              onBack={handleBack}
            />

            {/* ── NL Step 1: Intent & Data Staging ── */}
            {wStep === 1 && wMode === "nl" && (
              <div className="flex flex-1 min-h-0 animate-[fadeIn_0.4s_ease-out]">
                {/* Step context bar */}
                <div className="absolute top-[var(--header-height,60px)] hidden" />
                <div className="flex flex-1 flex-col overflow-y-auto">
                  {/* Sub-context bar */}
                  <div className="flex shrink-0 items-center gap-3 border-b border-ithina-border bg-ithina-purple/5 px-8 py-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ithina-purple">
                      <span className="text-[9px] font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-white">Intent & Data Staging</span>
                      <span className="ml-2 text-[10px] text-slate-500">Describe your promotion and review the AI-staged SKUs</span>
                    </div>
                    <span className="rounded-full border border-ithina-border px-2 py-0.5 font-mono text-[9px] text-slate-600">
                      Step 1 of {wSteps.length}
                    </span>
                    {/* Next button in context bar */}
                    {canProceedNl && (
                      <button
                        onClick={() => dispatch(setWStep(2))}
                        disabled={hwConfirmMutation.isPending}
                        className="flex items-center gap-2 rounded-lg bg-ithina-purple px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next: Select Screens
                        <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Pre-submit: centred zero state */}
                  {!hasSplit && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 animate-[fadeIn_0.4s_ease-out]">
                      <div className="text-center">
                        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-ithina-purple/20 bg-ithina-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                          <svg className="size-8 text-ithina-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-white">Campaign Intent Engine</h2>
                        <p className="mx-auto max-w-md text-sm text-slate-400">
                          Describe your promotion in plain language. AI will fetch live ROOS data, apply margins, and stage the SKUs.
                        </p>
                      </div>
                      <div className="w-full max-w-2xl rounded-2xl border border-ithina-border bg-ithina-panel p-5 shadow-xl">
                        <form
                          onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                          className="flex flex-col gap-3.5"
                        >
                          <div className="relative flex items-center rounded-xl border border-ithina-border bg-ithina-bg shadow-inner transition-colors focus-within:border-ithina-purple/50">
                            <input
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              type="text"
                              placeholder="Describe your promotion intent..."
                              autoFocus
                              className="w-full bg-transparent py-4 pl-5 pr-12 text-sm text-white placeholder:text-slate-500 focus:outline-none"
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              disabled={isTyping}
                              className="absolute right-2 rounded-lg bg-white/5 p-2 text-white transition-all hover:bg-ithina-purple disabled:opacity-50"
                            >
                              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                          </div>
                          <ConstraintBar disabled={intentMutation.isPending} onChange={handleConstraintChange} />
                        </form>
                      </div>
                      <button
                        onClick={handleSwitchToCsv}
                        className="flex items-center gap-2 rounded-xl border border-ithina-border bg-ithina-panel px-4 py-2.5 text-xs font-medium text-slate-400 transition-all hover:border-ithina-purple/30 hover:text-ithina-purple"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Or upload a SKU CSV instead
                      </button>
                    </div>
                  )}

                  {/* Post-submit: split screen (chat + grid) */}
                  {hasSplit && (
                    <div className="flex flex-1 min-h-0 gap-6 px-8 pb-6 pt-5">
                      <ChatPanel
                        messages={messages}
                        isTyping={isTyping}
                        inputText={inputText}
                        onInputChange={setInputText}
                        onSubmit={handleSubmit}
                        inputDisabled={intentMutation.isPending || hwConfirmMutation.isPending}
                        hasSplit={true}
                      >
                        <ConstraintBar disabled={intentMutation.isPending || hwConfirmMutation.isPending} onChange={handleConstraintChange} />
                      </ChatPanel>

                      {showGrid && (
                        <DataStagingGrid
                          data={gridData}
                          isGenerating={hwConfirmMutation.isPending}
                          onProceed={() => dispatch(setWStep(2))}
                          inputMode={inputMode}
                          onInputModeChange={handleInputModeChange}
                          onRemoveGridRow={handleRemoveGridRow}
                          csvRows={csvRows}
                          csvFileName={csvFileName}
                          csvConfirmed={csvConfirmed}
                          onCsvParsed={handleCsvParsed}
                          onCsvClear={handleCsvClear}
                          onCsvConfirm={handleCsvConfirm}
                          onRemoveCsvRow={handleRemoveCsvRow}
                          onRemoveAllViolations={handleRemoveAllViolations}
                          marginFloor={marginFloor}
                        />
                      )}
                      {!showGrid && inputMode !== "csv" && (
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ithina-border bg-ithina-panel">
                          <svg className="size-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
                          </svg>
                          <p className="text-xs text-slate-600">SKU staging grid will appear here after AI response</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── NL Step 2: Select Target Screens ── */}
            {wStep === 2 && wMode === "nl" && (
              <ScreenSelector
                mode="nl"
                stepNumber={2}
                totalSteps={wSteps.length}
                selectedDevices={selectedDevices}
                onToggleDevice={handleToggleDevice}
                onNext={handleNlGenerateLayouts}
                storeNumber={constraints.store}
              />
            )}

            {/* ── Manual Step 1: Select Your Screens ── */}
            {wStep === 1 && wMode === "manual" && (
              <ScreenSelector
                mode="manual"
                stepNumber={1}
                totalSteps={wSteps.length}
                selectedDevices={selectedDevices}
                onToggleDevice={handleToggleDevice}
                onNext={() => dispatch(setWStep(2))}
              />
            )}

            {/* ── Manual Step 2: Upload Banners ── */}
            {wStep === 2 && wMode === "manual" && (
              <ManualUpload
                stepNumber={2}
                totalSteps={wSteps.length}
                selectedDevices={selectedDevices}
                uploadedFiles={uploadedFiles}
                onFileUploaded={(id, name) => setUploadedFiles((prev) => ({ ...prev, [id]: name }))}
                onConfirm={handleManualConfirm}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
