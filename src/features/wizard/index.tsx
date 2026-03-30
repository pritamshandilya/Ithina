import { AlertTriangle, Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import type {
  ChatMessage,
  HardwareDeviceId,
  StagedSku,
  WizardConstraints,
} from "@/types/wizard";
import { useConfirmHardwareSelection, useSubmitWizardIntent } from "@/hooks/use-wizard";

import ChatPanel from "./components/chat-panel";
import ConstraintBar from "./components/constraint-bar";
import DataStagingGrid from "./components/data-staging-grid";
import HardwareModal from "./components/hardware-modal";
import WizardZeroState from "./components/zero-state";

export default function Wizard() {
  const navigate = useNavigate();

  const [hasSplit, setHasSplit] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gridData, setGridData] = useState<StagedSku[]>([]);
  const [error, setError] = useState<string | null>(null);
<<<<<<< Updated upstream
  const [constraints, setConstraints] = useState<WizardConstraints>({
    store: "4281",
    marginFloor: "15%",
    duration: "weekend",
=======
  const [scheduleInfo, setScheduleInfo] = useState<{ dateLabel: string; timeLabel: string }>({
    dateLabel: "Immediate",
    timeLabel: "08:00 AM",
>>>>>>> Stashed changes
  });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const addTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text || intentMutation.isPending) return;

    if (!hasSplit) setHasSplit(true);
    setError(null);

    pushMessage({ role: "user", text });
    setInputText("");
    setIsTyping(true);

    try {
      const { aiReply, skus } = await intentMutation.mutateAsync({ text, constraints });
      setIsTyping(false);
      pushMessage(aiReply);
      setShowGrid(true);

      if (gridData.length === 0) {
        skus.forEach((item, idx) => {
          addTimer(() => setGridData((prev) => [...prev, item]), idx * 150);
        });
      }
    } catch {
      setIsTyping(false);
      setError("Failed to process intent. Please try again.");
    }
  }, [inputText, intentMutation, hasSplit, constraints, gridData.length, pushMessage]);

  const handleConstraintChange = useCallback((c: WizardConstraints) => {
    setConstraints(c);
  }, []);

  const handleProceedToDesign = useCallback(() => {
    setShowHardwareModal(true);
  }, []);

  const handleHardwareConfirm = useCallback(
    async (deviceIds: HardwareDeviceId[]) => {
      setShowHardwareModal(false);
      setError(null);

      try {
        const msg = await hwConfirmMutation.mutateAsync(deviceIds);
        pushMessage(msg);
        setIsTyping(true);

<<<<<<< Updated upstream
        addTimer(() => {
          setIsTyping(false);
          navigate({ to: "/studio" });
        }, 3000);
      } catch {
        setError("Failed to confirm hardware. Please try again.");
      }
=======
    const now = new Date();
    const submittedAt = `${now.toLocaleDateString("en-US", { month: "short", day: "2-digit" })} · ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    const hardwareTargets = selectedDevices.length > 0
      ? selectedDevices.map(toApprovalHardwareLabel)
      : ['ESL 1.54"'];

    const pendingInboxItem: InboxItem = {
      id: resolvedId,
      title: resolvedName,
      subtitle: "Waiting for approver decision",
      initiator: "Wizard",
      skus: gridData.length > 0 ? gridData.length : 3,
      meta: "Pending",
      metaVariant: "muted",
      urgent: false,
      status: "pending",
      hardwareTargets,
      guardRailsLabel: "All Pass",
      submittedAt,
      scheduledDate: scheduleInfo.dateLabel,
      scheduledTime: scheduleInfo.timeLabel,
    };

    queryClient.setQueryData<InboxItem[] | undefined>(approvalKeys.inbox, (prev) => {
      if (!prev) return [pendingInboxItem];
      const withoutDuplicate = prev.filter((item) => item.id !== pendingInboxItem.id);
      return [pendingInboxItem, ...withoutDuplicate];
    });

    dispatch(setPendingApproval(true));
    dispatch(resetWizard());
    dispatch(resetStudio());
    navigate({ to: "/approval" });
  }, [campaignName, dispatch, gridData.length, navigate, queryClient, scheduleInfo.dateLabel, scheduleInfo.timeLabel, selectedDevices, toApprovalHardwareLabel]);

  // Manual flow confirm
  const handleManualConfirm = useCallback(async () => {
    const name = "Manual Upload – " + new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    try {
      const created = await createCampaignFromWizard(name, "Manual Upload");
      dispatch(activateCampaignWithId({ id: created.id, name: created.name }));
    } catch {
      dispatch(activateCampaign(name));
    }
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
>>>>>>> Stashed changes
    },
    [hwConfirmMutation, navigate, pushMessage],
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Campaign Wizard", isActive: true },
        ]}
        title="Intent & Data Staging"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 font-mono text-[11px] text-emerald-400">
            <Check className="h-3 w-3" strokeWidth={2} />
            ROOS Connected
          </div>
        }
      />

      <div className="relative flex flex-1 overflow-hidden p-6 lg:p-8">
        {error && (
          <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-900/90 px-4 py-2 text-xs text-rose-400 shadow-xl" role="alert">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        <div
          className={cn(
            "mx-auto flex w-full gap-6 transition-all duration-700",
            hasSplit
              ? "h-full max-w-[1600px] flex-row items-stretch"
              : "max-w-3xl flex-col items-center justify-center",
          )}
        >
          {!hasSplit && <WizardZeroState />}

          <ChatPanel
            messages={messages}
            isTyping={isTyping}
            inputText={inputText}
            onInputChange={setInputText}
            onSubmit={handleSubmit}
            inputDisabled={intentMutation.isPending || hwConfirmMutation.isPending}
            hasSplit={hasSplit}
          >
            <ConstraintBar disabled={intentMutation.isPending || hwConfirmMutation.isPending} onChange={handleConstraintChange} />
          </ChatPanel>

          {showGrid && (
            <DataStagingGrid
              data={gridData}
              isGenerating={hwConfirmMutation.isPending}
              onProceed={handleProceedToDesign}
            />
          )}
        </div>

<<<<<<< Updated upstream
        <HardwareModal
          open={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
          onConfirm={handleHardwareConfirm}
        />
=======
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
                    <div className="flex flex-1 min-h-0 gap-6 overflow-y-auto px-8 pb-6 pt-5">
                      {inputMode === "csv" ? (
                        <DataStagingGrid
                          data={gridData}
                          isGenerating={hwConfirmMutation.isPending}
                          inputMode={inputMode}
                          onInputModeChange={handleInputModeChange}
                          onRemoveGridRow={handleRemoveGridRow}
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
                              onRemoveGridRow={handleRemoveGridRow}
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
              <ScheduleStep
                onNext={handleNlNextFromSchedule}
                onScheduleChange={setScheduleInfo}
              />
            )}

            {wStep === 5 && wMode === "nl" && (
              <SubmitReviewStep
                onSubmit={handleNlSubmit}
                dataSourceLabel={inputMode === "csv" ? "CSV Upload" : "NL / AI Assisted"}
                skuCount={gridData.length || csvRows.length}
                scheduleDateLabel={scheduleInfo.dateLabel}
                scheduleTimeLabel={scheduleInfo.timeLabel}
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
>>>>>>> Stashed changes
      </div>
    </>
  );
}
