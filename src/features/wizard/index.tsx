import { AlertTriangle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activateCampaign,
  activateCampaignWithId,
  setPendingApproval,
  setStagedSkus,
} from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";
import {
  pushMessage as pushWizardMessage,
  removeAllCsvViolations,
  removeCsvRow,
  resetWizard,
  setCampaignNamed,
  setCsvConfirmed,
  setCsvFileName,
  setCsvRows,
  setGridData,
  setHasSplit,
  setInputMode as setWizardInputMode,
  setShowGrid,
  setWMode,
  setWStep,
  toggleGridRowIncluded,
  updateGridRowDiscount,
} from "@/store/slices/wizard-slice";
import type { HardwareDeviceId } from "@/types/wizard";
import { approvalKeys } from "@/hooks/use-approval";
import { campaignKeys } from "@/hooks/use-campaigns";
import { useConfirmHardwareSelection, useSubmitWizardIntent } from "@/hooks/use-wizard";
import { createCampaignFromWizard } from "@/services/campaigns";
import { PromoAuthService } from "@/lib/auth/promo-auth";
import type { CampaignListItem } from "@/types/campaigns";
import type { InboxItem } from "@/types/approval";
import ChatPanel from "./components/chat-panel";
import DataStagingGrid from "./components/data-staging-grid";
import type { InputMode } from "./components/data-staging-grid";
import ModeChooser from "./components/mode-chooser";
import type { WizardEntryInput, WizardMode } from "./components/mode-chooser";
import ScreenSelector from "./components/screen-selector";
import ManualUpload from "./components/manual-upload";
import WizardStepHeader from "./components/wizard-step-header";
import GuardRailsStep from "./components/guard-rails-step";
import ScheduleStep from "./components/schedule-step";
import SubmitReviewStep, { type SubmitDisplayTag } from "./components/submit-review-step";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

// Step 0 = mode chooser, steps 1..N = actual steps
// NL runtime currently implements first 2 steps, but header follows the new 5-step flow shell.
const NL_STEPS = ["Select Data", "Select Screens & Design", "Guard Rails", "Schedule", "Submit"];
const MANUAL_STEPS = ["Select Screens", "Upload Banners"];

function formatWizardScheduleDate(ymd: string): string {
  if (!ymd?.trim()) return "";
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export default function Wizard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // ── Device / upload state (local — not in redux) ───────────────────
  const [selectedDevices, setSelectedDevices] = useState<HardwareDeviceId[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<HardwareDeviceId, string>>>({});
  const [activeDevice, setActiveDevice] = useState<HardwareDeviceId | null>(null);
  const [designConfigured, setDesignConfigured] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | "C">("B");
  const [schedule, setSchedule] = useState<{
    startDate: string;
    startTime: string;
    endDate: string;
    autoApprove: boolean;
  }>({ startDate: "", startTime: "08:00", endDate: "", autoApprove: false });
  const [sizeByDevice, setSizeByDevice] = useState<Record<HardwareDeviceId, string[]>>({
    chroma29: [],
    chroma42: ['2.9"'],
    lcd: [],
  });

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

  const campaignName = useAppSelector((s) => s.campaign.name);

  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();

  /** LangGraph thread id from POST /campaigns/draft; required for follow-up turns and generate. */
  const pipelineSessionIdRef = useRef<string | null>(null);

  const wSteps = wMode === "nl" ? NL_STEPS : MANUAL_STEPS;

  const toApprovalHardwareLabel = useCallback((id: HardwareDeviceId): string => {
    if (id === "chroma29") return 'ESL 2.9"';
    if (id === "chroma42") return 'ESL 4.2"';
    return 'LCD 14"';
  }, []);

  const buildHardwareTargetsForApi = useCallback((): string[] => {
    const targets = new Set<string>();

    // ESL selection in UI can include multiple sizes; map each size to backend hardware target ids.
    if (selectedDevices.includes("chroma42")) {
      const sizeMap: Record<string, string> = {
        '1.54"': "chroma15",
        '2.13"': "chroma21",
        '2.9"': "chroma29",
        '4.2"': "chroma42",
        '5.83"': "chroma58",
        '7.5"': "chroma75",
      };
      const eslSizes = sizeByDevice.chroma42 ?? [];
      eslSizes.forEach((size) => {
        const mapped = sizeMap[size];
        if (mapped) targets.add(mapped);
      });
    }

    if (selectedDevices.includes("lcd")) {
      targets.add("lcd");
    }

    return Array.from(targets);
  }, [selectedDevices, sizeByDevice.chroma42]);

  const submitDisplayTags = useMemo((): SubmitDisplayTag[] => {
    const out: SubmitDisplayTag[] = [];
    for (const id of selectedDevices) {
      const sizes = sizeByDevice[id] ?? [];
      const variant: SubmitDisplayTag["variant"] = id === "lcd" ? "lcd" : "esl";
      if (sizes.length === 0) {
        out.push({ label: toApprovalHardwareLabel(id), variant });
      } else {
        for (const s of sizes) {
          out.push({
            label: id === "lcd" ? `LCD ${s}` : `ESL ${s}`,
            variant,
          });
        }
      }
    }
    return out;
  }, [selectedDevices, sizeByDevice, toApprovalHardwareLabel]);

  const includedGridSkuCount = useMemo(
    () => gridData.filter((r) => r.included !== false).length,
    [gridData],
  );

  // ── Navigation helpers ─────────────────────────────────────────────
  const handleSelectMode = useCallback((mode: WizardMode, input: WizardEntryInput) => {
    dispatch(setWMode(mode));
    dispatch(setWStep(1));
    dispatch(setWizardInputMode(input));
    dispatch(setHasSplit(input === "csv"));
    dispatch(setShowGrid(input === "csv"));
    setActiveDevice(null);
    setDesignConfigured(false);
    setShowStudio(false);
    setSelectedVariant("B");
    setSizeByDevice({
      chroma29: [],
      chroma42: ['2.9"'],
      lcd: [],
    });
    setSelectedDevices([]);
    pipelineSessionIdRef.current = null;
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

  const handleToggleDeviceSize = useCallback((id: HardwareDeviceId, size: string) => {
    setSizeByDevice((prev) => {
      const next = new Set(prev[id] ?? []);
      if (next.has(size)) next.delete(size);
      else next.add(size);
      return { ...prev, [id]: Array.from(next) };
    });
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
      const existingSessionId = pipelineSessionIdRef.current;
      const { aiReply, skus, sessionId } = await intentMutation.mutateAsync({
        text,
        constraints,
        ...(existingSessionId ? { sessionId: existingSessionId } : {}),
      });
      pipelineSessionIdRef.current = sessionId;
      setIsTyping(false);
      pushMessage(aiReply);
      dispatch(setGridData(skus));
    } catch {
      setIsTyping(false);
      setError("Failed to process intent. Please try again.");
    }
  }, [inputText, intentMutation, hasSplit, showGrid, constraints, pushMessage, generateCampaignName, dispatch]);

  const handleNlNextFromScreens = useCallback(() => {
    dispatch(setWStep(3));
  }, [dispatch]);

  const handleNlNextFromGuardRails = useCallback(() => {
    dispatch(setWStep(4));
  }, [dispatch]);

  const handleNlNextFromSchedule = useCallback(
    (payload: { startDate: string; startTime: string; endDate: string; autoApprove: boolean }) => {
      setSchedule({
        startDate: payload.startDate,
        startTime: payload.startTime,
        endDate: payload.endDate,
        autoApprove: payload.autoApprove,
      });
      dispatch(setWStep(5));
    },
    [dispatch],
  );

  const handleNlSubmit = useCallback(async () => {
    const hardwareTargetsForApi = buildHardwareTargetsForApi();
    if (hardwareTargetsForApi.length === 0) {
      setError("Select at least one hardware target before submit.");
      return;
    }
    const resolvedName = campaignName || "Untitled Campaign";
    let resolvedId = `inbox-${Date.now()}`;
    let submitSucceeded = false;
    let created: CampaignListItem | null = null;
    try {
      const sessionId =
        pipelineSessionIdRef.current ??
        (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `session-${Date.now()}`);
      created = await createCampaignFromWizard(resolvedName, hardwareTargetsForApi, {
        sessionId,
        schedule: {
          startDate: schedule.startDate,
          startTime: schedule.startTime,
          endDate: schedule.endDate,
        },
      });
      dispatch(activateCampaignWithId({ id: created.id, name: created.name }));
      resolvedId = created.id;
      await queryClient.invalidateQueries({ queryKey: campaignKeys.list });
      submitSucceeded = true;
    } catch {
      setError("Failed to submit campaign for approval. Please fix and try again.");
      return;
    }

    if (!submitSucceeded || !created) return;

    const now = new Date();
    const submittedAt = `${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} · ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    const hardwareTargets = selectedDevices.map(toApprovalHardwareLabel);

    const currentUser = PromoAuthService.getCurrentUser();
    const fromProfile = currentUser
      ? [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ").trim()
      : "";
    const initiatorDisplay =
      created.ownerName?.trim() ||
      created.initiator?.trim() ||
      fromProfile ||
      "You";

    const pendingInboxItem: InboxItem = {
      id: resolvedId,
      title: resolvedName,
      subtitle: "Waiting for approver decision",
      initiator: initiatorDisplay,
      skus:
        inputMode === "csv"
          ? csvRows.length
          : gridData.length > 0
            ? includedGridSkuCount
            : 3,
      meta: "Pending",
      metaVariant: "muted",
      urgent: false,
      status: "pending",
      hardwareTargets,
      guardRailsLabel: "All Pass",
      submittedAt,
    };

    queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
      if (!prev) return [pendingInboxItem];
      const withoutDuplicate = prev.filter((item) => item.id !== pendingInboxItem.id);
      return [pendingInboxItem, ...withoutDuplicate];
    });

    dispatch(setPendingApproval(true));
    dispatch(resetWizard());
    dispatch(resetStudio());
    navigate({ to: "/campaigns" });
  }, [
    buildHardwareTargetsForApi,
    campaignName,
    csvRows.length,
    dispatch,
    gridData.length,
    includedGridSkuCount,
    inputMode,
    navigate,
    queryClient,
    schedule.startDate,
    schedule.startTime,
    schedule.endDate,
    selectedDevices,
    toApprovalHardwareLabel,
  ]);

  // Manual flow confirm
  const handleManualConfirm = useCallback(async () => {
    const hardwareTargetsForApi = buildHardwareTargetsForApi();
    if (hardwareTargetsForApi.length === 0) {
      setError("Select at least one hardware target before continuing.");
      return;
    }
    const name = "Manual Upload – " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    try {
      const sessionId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `session-${Date.now()}`;
      const created = await createCampaignFromWizard(name, hardwareTargetsForApi, {
        sessionId,
        schedule: { startDate: "", startTime: "08:00", endDate: "" },
      });
      dispatch(activateCampaignWithId({ id: created.id, name: created.name }));
    } catch {
      dispatch(activateCampaign(name));
    }
    dispatch(resetWizard());
    dispatch(resetStudio());
    navigate({ to: "/studio" });
  }, [buildHardwareTargetsForApi, dispatch, navigate]);

  // ── CSV handlers ───────────────────────────────────────────────────
  const handleInputModeChange = useCallback(
    (mode: InputMode) => dispatch(setWizardInputMode(mode)),
    [dispatch],
  );
  const handleToggleGridRowIncluded = useCallback(
    (sku: string) => dispatch(toggleGridRowIncluded(sku)),
    [dispatch],
  );
  const handleDiscountChange = useCallback(
    (sku: string, discount: number) => dispatch(updateGridRowDiscount({ sku, discount })),
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
  const handleCsvConfirmAndProceed = useCallback(() => {
    handleCsvConfirm();
    dispatch(setWStep(2));
  }, [handleCsvConfirm, dispatch]);
  const handleRemoveCsvRow = useCallback(
    (idx: number) => dispatch(removeCsvRow(idx)),
    [dispatch],
  );
  const handleRemoveAllViolations = useCallback(() => dispatch(removeAllCsvViolations()), [dispatch]);

  const marginFloor = parseInt(constraints.marginFloor) / 100;

  // ── Proceed button visibility for NL step 1 ────────────────────────
  const canProceedNl =
    (inputMode === "ai" &&
      showGrid &&
      (gridData.length === 0 || includedGridSkuCount > 0)) ||
    (inputMode === "csv" && csvConfirmed);

  return (
    <>

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
              inputMode={inputMode}
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
                      <span className="text-xs font-semibold text-white">Select Data</span>
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
                        Next: Select Screens & Design
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
                        <h2 className="mb-2 text-2xl font-bold text-white">What's the promotion?</h2>
                        <p className="mx-auto max-w-md text-sm text-slate-400">
                          Describe it in plain English - ROOS will find matching SKUs and prices.
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
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Post-submit: split screen (chat + grid) */}
                  {hasSplit && (
                    <div className="flex min-h-0 flex-1 gap-6 overflow-x-auto overflow-y-auto px-8 pb-6 pt-5">
                      {inputMode === "csv" ? (
                        <DataStagingGrid
                          data={gridData}
                          isGenerating={hwConfirmMutation.isPending}
                          inputMode={inputMode}
                          onInputModeChange={handleInputModeChange}
                          onToggleGridRowIncluded={handleToggleGridRowIncluded}
                          onDiscountChange={handleDiscountChange}
                          csvRows={csvRows}
                          csvFileName={csvFileName}
                          onCsvParsed={handleCsvParsed}
                          onCsvClear={handleCsvClear}
                          onCsvConfirm={handleCsvConfirm}
                          onCsvConfirmAndProceed={handleCsvConfirmAndProceed}
                          onRemoveCsvRow={handleRemoveCsvRow}
                          onRemoveAllViolations={handleRemoveAllViolations}
                          marginFloor={marginFloor}
                          hideModeToggle
                        />
                      ) : (
                        <>
                          <ChatPanel
                            messages={messages}
                            isTyping={isTyping}
                            inputText={inputText}
                            onInputChange={setInputText}
                            onSubmit={handleSubmit}
                            inputDisabled={intentMutation.isPending || hwConfirmMutation.isPending}
                            hasSplit={true}
                          />

                          {showGrid && (
                            <DataStagingGrid
                              data={gridData}
                              isGenerating={hwConfirmMutation.isPending}
                              inputMode={inputMode}
                              onInputModeChange={handleInputModeChange}
                              onToggleGridRowIncluded={handleToggleGridRowIncluded}
                              onDiscountChange={handleDiscountChange}
                              csvRows={csvRows}
                              csvFileName={csvFileName}
                              onCsvParsed={handleCsvParsed}
                              onCsvClear={handleCsvClear}
                              onCsvConfirm={handleCsvConfirm}
                              onRemoveCsvRow={handleRemoveCsvRow}
                              onRemoveAllViolations={handleRemoveAllViolations}
                              marginFloor={marginFloor}
                            />
                          )}
                        </>
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
                activeDevice={activeDevice}
                onSetActiveDevice={setActiveDevice}
                designConfigured={designConfigured}
                onSetDesignConfigured={setDesignConfigured}
                showStudio={showStudio}
                onSetShowStudio={setShowStudio}
                selectedVariant={selectedVariant}
                onSetSelectedVariant={setSelectedVariant}
                sizeByDevice={sizeByDevice}
                onToggleSize={handleToggleDeviceSize}
                onNext={handleNlNextFromScreens}
                storeNumber={constraints.store}
              />
            )}

            {wStep === 3 && wMode === "nl" && (
              <GuardRailsStep onNext={handleNlNextFromGuardRails} />
            )}

            {wStep === 4 && wMode === "nl" && (
              <ScheduleStep onNext={handleNlNextFromSchedule} />
            )}

            {wStep === 5 && wMode === "nl" && (
              <SubmitReviewStep
                onSubmit={handleNlSubmit}
                dataSourceLabel={inputMode === "csv" ? "CSV Upload" : "NL / AI Assisted"}
                skuCount={inputMode === "csv" ? csvRows.length : includedGridSkuCount}
                scheduleDateLabel={formatWizardScheduleDate(schedule.startDate) || "Immediate"}
                scheduleTimeLabel={schedule.startTime || "08:00"}
                scheduleEndLabel={
                  schedule.endDate?.trim() ? formatWizardScheduleDate(schedule.endDate) : undefined
                }
                autoApproveNote={
                  schedule.autoApprove
                    ? "Auto-approve when schedule triggers (low-risk campaigns only)."
                    : undefined
                }
                displayTags={submitDisplayTags}
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
                activeDevice={activeDevice}
                onSetActiveDevice={setActiveDevice}
                designConfigured={designConfigured}
                onSetDesignConfigured={setDesignConfigured}
                showStudio={showStudio}
                onSetShowStudio={setShowStudio}
                selectedVariant={selectedVariant}
                onSetSelectedVariant={setSelectedVariant}
                sizeByDevice={sizeByDevice}
                onToggleSize={handleToggleDeviceSize}
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
