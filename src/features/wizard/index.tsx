import { AlertTriangle } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
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
} from "@/store/slices/wizard-slice";
import type { HardwareDeviceId, WizardConstraints } from "@/types/wizard";
import { useScheduledCallback } from "@/hooks/use-scheduled-callback";
import { useConfirmHardwareSelection, useSubmitWizardIntent } from "@/hooks/use-wizard";

import ChatPanel from "./components/chat-panel";
import ConstraintBar from "./components/constraint-bar";
import DataStagingGrid from "./components/data-staging-grid";
import type { InputMode } from "./components/data-staging-grid";
import HardwareModal from "./components/hardware-modal";
import WizardZeroState from "./components/zero-state";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

export default function Wizard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
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

  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addTimer = useScheduledCallback();
  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();

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
      const name = `${base} — ${suffix}`;
      dispatch(activateCampaign(name));
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
    (c: WizardConstraints) => {
      dispatch(setWizardConstraints(c));
    },
    [dispatch],
  );

  const handleProceedToDesign = useCallback(() => {
    setShowHardwareModal(true);
  }, []);

  const handleHardwareConfirm = useCallback(
    async (deviceIds: HardwareDeviceId[]) => {
      setShowHardwareModal(false);
      setError(null);

      if (inputMode === "csv" && csvConfirmed) {
        dispatch(setStagedSkus(csvRows));
      }

      try {
        const msg = await hwConfirmMutation.mutateAsync(deviceIds);
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
    },
    [hwConfirmMutation, navigate, pushMessage, inputMode, csvConfirmed, csvRows, dispatch, addTimer],
  );

  const handleInputModeChange = useCallback(
    (mode: InputMode) => {
      dispatch(setWizardInputMode(mode));
    },
    [dispatch],
  );

  const handleRemoveGridRow = useCallback(
    (sku: string) => {
      dispatch(removeGridRow(sku));
    },
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
    (idx: number) => {
      dispatch(removeCsvRow(idx));
    },
    [dispatch],
  );

  const handleRemoveAllViolations = useCallback(() => {
    dispatch(removeAllCsvViolations());
  }, [dispatch]);

  const handleSwitchToCsv = useCallback(() => {
    handleInputModeChange("csv");
  }, [handleInputModeChange]);

  const marginFloor = parseInt(constraints.marginFloor) / 100;

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: "Promotions Assistant" },
          { label: "Campaign Wizard", isActive: true },
        ]}
        title="Intent & Data Staging"
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
          {!hasSplit && <WizardZeroState onSwitchToCsv={handleSwitchToCsv} />}

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
        </div>

        <HardwareModal
          open={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
          onConfirm={handleHardwareConfirm}
        />
      </div>
    </>
  );
}
