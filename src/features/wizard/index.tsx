import { AlertTriangle, Check } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { activateCampaign, setStagedSkus } from "@/store/slices/campaign-slice";
import type {
  ChatMessage,
  HardwareDeviceId,
  StagedSku,
  WizardConstraints,
} from "@/types/wizard";
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

  const [hasSplit, setHasSplit] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gridData, setGridData] = useState<StagedSku[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<WizardConstraints>({
    store: "4281",
    marginFloor: "15%",
    duration: "weekend",
  });

  const [inputMode, setInputMode] = useState<InputMode>("ai");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvConfirmed, setCsvConfirmed] = useState(false);
  const [campaignNamed, setCampaignNamed] = useState(false);

  const addTimer = useScheduledCallback();
  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const generateCampaignName = useCallback((prompt: string) => {
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
    setCampaignNamed(true);
  }, [campaignNamed, dispatch]);

  const handleSubmit = useCallback(async () => {
    const text = inputText.trim();
    if (!text || intentMutation.isPending) return;

    if (!hasSplit) setHasSplit(true);
    if (!showGrid) setShowGrid(true);
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
          addTimer(() => setGridData((prev) => [...prev, item]), idx * 150);
        });
      }
    } catch {
      setIsTyping(false);
      setError("Failed to process intent. Please try again.");
    }
  }, [inputText, intentMutation, hasSplit, showGrid, constraints, gridData.length, pushMessage, generateCampaignName]);

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

      if (inputMode === "csv" && csvConfirmed) {
        dispatch(setStagedSkus(csvRows));
      }

      try {
        const msg = await hwConfirmMutation.mutateAsync(deviceIds);
        pushMessage(msg);
        setIsTyping(true);

        addTimer(() => {
          setIsTyping(false);
          navigate({ to: "/studio" });
        }, 3000);
      } catch {
        setError("Failed to confirm hardware. Please try again.");
      }
    },
    [hwConfirmMutation, navigate, pushMessage, inputMode, csvConfirmed, csvRows, dispatch],
  );

  const handleInputModeChange = useCallback((mode: InputMode) => {
    setInputMode(mode);
    if (mode === "csv") {
      setHasSplit(true);
      setShowGrid(true);
    }
  }, []);

  const handleRemoveGridRow = useCallback((sku: string) => {
    setGridData((prev) => prev.filter((r) => r.sku !== sku));
  }, []);

  const handleCsvParsed = useCallback((rows: CsvRow[], fileName: string) => {
    setCsvRows(rows);
    setCsvFileName(fileName);
    setCsvConfirmed(false);
    setHasSplit(true);
    setShowGrid(true);
  }, []);

  const handleCsvClear = useCallback(() => {
    setCsvRows([]);
    setCsvFileName("");
    setCsvConfirmed(false);
  }, []);

  const handleCsvConfirm = useCallback(() => {
    setCsvConfirmed(true);
    dispatch(setStagedSkus(csvRows));
    const warningCount = csvRows.filter((r) => !r.safe).length;
    pushMessage({
      role: "ai",
      text: `${csvRows.length} SKUs loaded from CSV and staged for creative. ${warningCount ? `<span class="text-amber-400">${warningCount} items have low margin — please review.</span>` : "All margin checks passed."}`,
    });
  }, [csvRows, dispatch, pushMessage]);

  const handleRemoveCsvRow = useCallback((idx: number) => {
    setCsvRows((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleRemoveAllViolations = useCallback(() => {
    setCsvRows((prev) => prev.filter((r) => r.safe));
  }, []);

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
