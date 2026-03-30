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
  const [constraints, setConstraints] = useState<WizardConstraints>({
    store: "4281",
    marginFloor: "15%",
    duration: "weekend",
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

        addTimer(() => {
          setIsTyping(false);
          navigate({ to: "/studio" });
        }, 3000);
      } catch {
        setError("Failed to confirm hardware. Please try again.");
      }
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

        <HardwareModal
          open={showHardwareModal}
          onClose={() => setShowHardwareModal(false)}
          onConfirm={handleHardwareConfirm}
        />
      </div>
    </>
  );
}
