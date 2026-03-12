import { AlertTriangle, SquareKanban, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { activateCampaign, setPendingApproval } from "@/store/slices/campaign-slice";
import type {
  ChatMessage,
  HardwareDeviceId,
  RecentCampaign,
  StudioState,
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
  const { data: recentCampaigns = [] } = useRecentCampaigns();

  const [state, setState] = useState<StudioState>("choose");
  const [activeHw, setActiveHw] = useState<HardwareDeviceId>("chroma42");
  const [isTyping, setIsTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCampaignPicker, setShowCampaignPicker] = useState(!campaign.active);

  const [einkHeaderClass, setEinkHeaderClass] = useState("h-16 text-2xl");
  const [einkHeaderText, setEinkHeaderText] = useState("EXPIRING IN 48H");
  const [eink29ProductText, setEink29ProductText] = useState("Premium Salmon");
  const [eink29PriceText, setEink29PriceText] = useState("$10.39");
  const [lcdBgUrl, setLcdBgUrl] = useState(
    "url('https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80')",
  );

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
      setMessages([initialMsg]);
    }
  }, [initialMsg, messages.length]);

  const pushMsg = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleHwSelect = useCallback(
    async (id: HardwareDeviceId) => {
      if (id === activeHw) return;
      setActiveHw(id);
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
    [activeHw, state, hwOptions, pushMsg, switchHwMut],
  );

  const handleVariantSelect = useCallback(
    async (id: VariantId) => {
      setError(null);
      try {
        setState("refine");
        const { user, ai } = await selectVariantMut.mutateAsync(id);
        pushMsg(user);
        pushMsg(ai);
      } catch {
        setError("Failed to select variant.");
      }
    },
    [pushMsg, selectVariantMut],
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
          setLcdBgUrl("url('https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1920&q=80')");
        } else if (activeHw === "chroma29") {
          setEink29ProductText("Salmon 8pc");
          setEink29PriceText("$10.39");
        } else {
          setEinkHeaderClass("h-24 text-4xl");
          setEinkHeaderText("TODAY ONLY");
        }

        pushMsg(aiMsg);
      }, 2500);
    } catch {
      setIsTyping(false);
      setIsScanning(false);
      setError("Failed to refine layout.");
    }
  }, [inputText, state, activeHw, pushMsg, chatRefineMut]);

  const handleSendToApproval = useCallback(() => {
    dispatch(setPendingApproval(true));
    navigate({ to: "/approval" });
  }, [navigate, dispatch]);

  const loadCampaign = useCallback((c: RecentCampaign) => {
    dispatch(activateCampaign(c.name));
    setShowCampaignPicker(false);
    setState("choose");
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

        {campaign.active && showCampaignPicker && (
          <div className="shrink-0 animate-[fadeIn_0.3s_ease-out] rounded-2xl border border-ithina-border bg-ithina-panel p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Switch Campaign</h3>
              <button onClick={() => setShowCampaignPicker(false)} className="p-1 text-slate-400 transition-colors hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {recentCampaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => loadCampaign(c)}
                  className="rounded-xl border border-ithina-border bg-ithina-bg p-3 text-left transition-all hover:border-ithina-purple/50 hover:bg-ithina-purple/5"
                >
                  <span className="mb-0.5 block truncate text-xs font-medium text-white">{c.name}</span>
                  <span className="block font-mono text-[9px] text-slate-500">{c.skus} SKUs · {c.hw}</span>
                  <span className={cn("mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[8px]", c.statusCls)}>{c.status}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {campaign.active && !showCampaignPicker && (
          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-ithina-border bg-ithina-panel px-5 py-3 shadow-sm">
            <SquareKanban className="size-4 shrink-0 text-ithina-purple" />
            <span className="flex-1 truncate text-sm font-medium text-white">{campaign.name || "Untitled Campaign"}</span>
            <button onClick={() => setShowCampaignPicker(true)} className="rounded-lg border border-ithina-border px-2.5 py-1 font-mono text-[10px] text-slate-400 transition-colors hover:border-ithina-purple/30 hover:text-ithina-purple">
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
