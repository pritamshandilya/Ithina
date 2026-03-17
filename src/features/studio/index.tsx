import { AlertTriangle, ChevronLeft, SquareKanban } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activateCampaign, deactivateCampaign, setPendingApproval } from "@/store/slices/campaign-slice";
import {
  pushStudioMessage,
  resetStudio,
  setActiveHw,
  setEink29PriceText,
  setEink29ProductText,
  setEinkHeaderClass,
  setEinkHeaderText,
  setLcdBgUrl,
  setStudioMessages,
  setStudioState,
} from "@/store/slices/studio-slice";
import type {
  ChatMessage,
  HardwareDeviceId,
  RecentCampaign,
  VariantId,
} from "@/types/studio";
import { useScheduledCallback } from "@/hooks/use-scheduled-callback";
import {
  useAssetInfo,
  useComplianceChecks,
  useHwOptions,
  useInitialMessage,
  useLayoutVariants,
  useRecentCampaigns,
  useRendererSpec,
  useSelectVariant,
  useSubmitChatRefine,
  useSwitchHardware,
} from "@/hooks/use-studio";

import AssetPanel from "./components/asset-panel";
import CampaignGate from "./components/campaign-gate";
import ComplianceSidebar from "./components/compliance-sidebar";
import EslPreview from "./components/esl-preview";
import HardwareSelector from "./components/hardware-selector";
import StudioChat from "./components/studio-chat";
import VariantChooser from "./components/variant-chooser";

export default function Studio() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const campaign = useAppSelector((s) => s.campaign);
  const {
    state,
    activeHw,
    messages,
    einkHeaderClass,
    einkHeaderText,
    eink29ProductText,
    eink29PriceText,
    lcdBgUrl,
  } = useAppSelector((s) => s.studio);

  const { data: recentCampaigns = [] } = useRecentCampaigns();

  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCampaignPicker, setShowCampaignPicker] = useState(!campaign.active);

  const addTimer = useScheduledCallback();

  const { data: hwOptions = [], isLoading: hwLoading, isError: hwError } = useHwOptions();
  const { data: variants = [], isLoading: varLoading } = useLayoutVariants();
  const { data: checks = [], isLoading: checksLoading } = useComplianceChecks();
  const { data: spec, isLoading: specLoading } = useRendererSpec(activeHw);
  const { data: asset, isLoading: assetLoading } = useAssetInfo();
  const { data: initialMsg, isLoading: msgLoading } = useInitialMessage();

  const selectVariantMut = useSelectVariant();
  const chatRefineMut = useSubmitChatRefine();
  const switchHwMut = useSwitchHardware();

  const isLoading = hwLoading || varLoading || checksLoading || specLoading || assetLoading || msgLoading;
  const hasError = hwError;

  useEffect(() => {
    if (initialMsg && messages.length === 0) {
      dispatch(setStudioMessages([initialMsg]));
    }
  }, [initialMsg, messages.length, dispatch]);

  const pushMsg = useCallback(
    (msg: ChatMessage) => {
      dispatch(pushStudioMessage(msg));
    },
    [dispatch],
  );

  const handleHwSelect = useCallback(
    async (id: HardwareDeviceId) => {
      if (id === activeHw) return;
      dispatch(setActiveHw(id));
      setError(null);

      if (state === "refine") {
        const hw = hwOptions.find((h) => h.id === id);
        pushMsg({ role: "user", text: `Switch target hardware to ${hw?.label}.` });
        setIsTyping(true);
        setIsScanning(true);

        try {
          const aiMsg = await switchHwMut.mutateAsync(hw?.label ?? "");
          addTimer(() => {
            setIsTyping(false);
            setIsScanning(false);
            pushMsg(aiMsg);
          }, 1600);
        } catch {
          setIsTyping(false);
          setIsScanning(false);
          setError("Failed to switch hardware.");
        }
      }
    },
    [activeHw, state, hwOptions, pushMsg, switchHwMut, addTimer, dispatch],
  );

  const handleVariantSelect = useCallback(
    async (id: VariantId) => {
      setError(null);
      try {
        dispatch(setStudioState("refine"));
        const { user, ai } = await selectVariantMut.mutateAsync(id);
        pushMsg(user);
        pushMsg(ai);
      } catch {
        setError("Failed to select variant.");
      }
    },
    [pushMsg, selectVariantMut, dispatch],
  );

  const handleChatSubmit = useCallback(async () => {
    if (!inputText.trim() || state === "choose") return;
    const text = inputText;
    pushMsg({ role: "user", text });
    setInputText("");
    setIsTyping(true);
    setIsScanning(true);
    setError(null);

    try {
      const aiMsg = await chatRefineMut.mutateAsync({ text, hw: activeHw });
      addTimer(() => {
        setIsTyping(false);
        setIsScanning(false);

        if (activeHw === "lcd") {
          dispatch(setLcdBgUrl("url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1920&q=80')"));
        } else if (activeHw === "chroma29") {
          dispatch(setEink29ProductText("Salmon 8pc"));
          dispatch(setEink29PriceText("$10.39"));
        } else {
          dispatch(setEinkHeaderClass("h-24 text-4xl"));
          dispatch(setEinkHeaderText("TODAY ONLY"));
        }

        pushMsg(aiMsg);
      }, 2500);
    } catch {
      setIsTyping(false);
      setIsScanning(false);
      setError("Failed to refine layout.");
    }
  }, [inputText, state, activeHw, pushMsg, chatRefineMut, addTimer, dispatch]);

  const handleSendToApproval = useCallback(() => {
    dispatch(setPendingApproval(true));
    navigate({ to: "/approval" });
  }, [navigate, dispatch]);

  const loadCampaign = useCallback(
    (c: RecentCampaign) => {
      dispatch(activateCampaign(c.name));
      dispatch(resetStudio());
      setShowCampaignPicker(false);
    },
    [dispatch],
  );

  const handleExitToGate = useCallback(() => {
    dispatch(deactivateCampaign());
    dispatch(resetStudio());
    setShowCampaignPicker(false);
  }, [dispatch]);

  const handleSwitchCampaign = useCallback(() => {
    dispatch(deactivateCampaign());
    dispatch(resetStudio());
    setShowCampaignPicker(true);
  }, [dispatch]);

  const studioHeader = (
    <PageHeader
      breadcrumbs={[{ label: "Promotions Assistant" }, { label: "Campaign Studio", isActive: true }]}
      title="Creative Layout Editor"
    />
  );

  if (isLoading) {
    return (
      <>
        {studioHeader}
        <LoadingSpinner label="Loading studio..." className="flex-1" />
      </>
    );
  }

  if (hasError) {
    return (
      <>
        {studioHeader}
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center" role="alert">
          <AlertTriangle className="size-10 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Failed to load studio data</h3>
          <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
        </div>
      </>
    );
  }

  if (!spec || !asset) return null;

  return (
    <>
      {studioHeader}

      <div className="relative flex flex-1 flex-col gap-4 overflow-hidden p-6 lg:p-8">
        {error && (
          <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-900/90 px-4 py-2 text-xs text-rose-400 shadow-xl" role="alert">
            <AlertTriangle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {!campaign.active && (
          <CampaignGate
            showPicker={showCampaignPicker}
            recentCampaigns={recentCampaigns}
            onShowPicker={() => setShowCampaignPicker(true)}
            onHidePicker={() => setShowCampaignPicker(false)}
            onLoadCampaign={loadCampaign}
          />
        )}

        {campaign.active && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-ithina-border bg-ithina-panel px-4 py-3 shadow-sm">
            <button
              onClick={handleExitToGate}
              title="Back to Studio Gate"
              className="flex size-7 items-center justify-center rounded-lg border border-ithina-border text-slate-500 transition-all hover:bg-ithina-border hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="mx-1 h-4 w-px bg-ithina-border" />
            <SquareKanban className="size-4 shrink-0 text-ithina-purple" />
            <span className="flex-1 truncate text-sm font-medium text-white">{campaign.name || "Untitled Campaign"}</span>
            <button
              onClick={handleSwitchCampaign}
              className="rounded-lg border border-ithina-border px-2.5 py-1 font-mono text-[10px] text-slate-400 transition-colors hover:border-ithina-purple/30 hover:text-ithina-purple"
            >
              Switch Campaign
            </button>
          </div>
        )}

        {campaign.active && (
          <div className="flex min-h-0 flex-1 flex-row items-stretch gap-6 overflow-hidden">
            <div className="z-20 flex h-full w-[360px] shrink-0 flex-col gap-5">
              <StudioChat
                messages={messages}
                isTyping={isTyping}
                inputText={inputText}
                onInputChange={setInputText}
                onSubmit={handleChatSubmit}
                state={state}
              />
              <AssetPanel asset={asset} />
            </div>

            <div className="relative flex min-h-0 w-full flex-1 gap-6">
              {state === "choose" && (
                <VariantChooser
                  variants={variants}
                  hwOptions={hwOptions}
                  activeHw={activeHw}
                  onHwSelect={handleHwSelect}
                  onVariantSelect={handleVariantSelect}
                />
              )}

              {state === "refine" && (
                <>
                  <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-ithina-border bg-ithina-panel shadow-xl">
                    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-ithina-border bg-ithina-bg/90 px-3 py-2 shadow-xl backdrop-blur">
                      <span className="shrink-0 font-mono text-[10px] uppercase text-ithina-muted">Target:</span>
                      <HardwareSelector options={hwOptions} active={activeHw} onSelect={handleHwSelect} />
                    </div>

                    <EslPreview
                      hw={activeHw}
                      headerText={einkHeaderText}
                      headerClass={einkHeaderClass}
                      product29Text={eink29ProductText}
                      price29Text={eink29PriceText}
                      lcdBgUrl={lcdBgUrl}
                      isScanning={isScanning}
                    />
                  </div>

                  <ComplianceSidebar
                    checks={checks}
                    spec={spec}
                    hw={activeHw}
                    isScanning={isScanning}
                    onSendToApproval={handleSendToApproval}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
