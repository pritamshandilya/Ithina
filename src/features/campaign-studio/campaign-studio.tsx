import {
  ArrowLeft,
  Check,
  ChevronDown,
  Monitor,
  RectangleHorizontal,
  Send,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";

import AiModifyPanel from "@/features/wizard/components/ai-modify-panel";
import {
  ESL_VARIANTS,
  EslLivePreview,
  EslVariantCard,
  LcdLivePreview,
  LcdVariantCard,
  STUDIO_TABS,
  studioHardwareIsLcd,
  type StudioTabId,
} from "@/features/campaign-studio/campaign-studio-shared-ui";
import { useCampaignEvents } from "@/hooks/use-campaign-events";
import { useCampaign, usePostCampaignChat, useSubmitCampaign } from "@/hooks/use-campaigns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";

import {
  extractVariantsFromEvents,
  getSubmittedVariantId,
  groupVariantsByLetter,
  hasEventType,
  type GroupedVariant,
  type StudioPhase,
} from "./types";

const API_BASE =
  (import.meta.env.VITE_PROMO_API_URL as string | undefined) ??
  "https://backend.promo.creativebits.tech";

const TERMINAL_STATUSES = new Set([
  "pending_approval",
  "approved",
  "publishing",
  "active",
  "rejected",
  "failed",
]);

function resolvePhase(
  campaignStatus: string | undefined,
  events: ApiCampaignEventResponse[],
): StudioPhase {
  if (campaignStatus === "failed") return "failed";
  if (hasEventType(events, "layout_generated")) return "preview";
  if (
    campaignStatus &&
    TERMINAL_STATUSES.has(campaignStatus) &&
    campaignStatus !== "failed"
  ) {
    return "submitted";
  }
  if (hasEventType(events, "error")) return "failed";
  return "generating";
}

function sortGrouped(grouped: GroupedVariant[]): GroupedVariant[] {
  const order: Record<string, number> = { A: 0, B: 1, C: 2 };
  return [...grouped].sort(
    (a, b) => (order[a.variantId] ?? 99) - (order[b.variantId] ?? 99),
  );
}

function variantPreviewUrl(
  sortedGrouped: GroupedVariant[],
  variantId: string,
  activeHardware: string,
  apiBase: string,
  cacheBuster = 0,
): string | null {
  const g = sortedGrouped.find((x) => x.variantId === variantId);
  if (!g) return null;
  const layout = g.images[activeHardware] ?? Object.values(g.images)[0];
  const path = layout?.image_url;
  if (path == null || String(path).trim() === "") return null;
  const s = String(path).trim();
  const base = s.startsWith("http://") || s.startsWith("https://")
    ? s
    : `${apiBase}${s.startsWith("/") ? s : `/${s}`}`;
  return cacheBuster > 0 ? `${base}?v=${cacheBuster}` : base;
}

function abcVariant(
  id: string,
): "A" | "B" | "C" {
  if (id === "A" || id === "B" || id === "C") return id;
  return "B";
}

export default function CampaignStudio() {
  const { campaignId } = useParams({ strict: false }) as { campaignId: string };
  const navigate = useNavigate();

  const { data: campaign, refetch: refetchCampaign } = useCampaign(campaignId);
  const campaignStatus = campaign?.apiStatus;

  const { events, startPolling } = useCampaignEvents(campaignId, {
    intervalMs: 2_500,
    initialPolling: true,
    apiStatus: campaignStatus,
    shouldStop: ({ events: ev, apiStatus: st }) => {
      if (st === "failed" || st === "rejected") return true;
      if (hasEventType(ev, "campaign_published")) return true;
      if (st === "approved") return true;
      if (st === "pending_approval" && hasEventType(ev, "layout_generated")) {
        return true;
      }
      return false;
    },
  });

  const phase = resolvePhase(campaignStatus, events);
  const isReadOnlySubmitted =
    campaignStatus === "pending_approval" ||
    campaignStatus === "publishing" ||
    campaignStatus === "approved";

  const [selectedVariant, setSelectedVariant] = useState<string>("B");
  const [activeHardware, setActiveHardware] = useState<string>("");
  const [isRefining, setIsRefining] = useState(false);
  /** After POST /chat, clear refining when a layout event newer than this arrives. */
  const chatLayoutSinceMsRef = useRef(0);
  const [imageCacheBuster, setImageCacheBuster] = useState(0);
  const [hwDropdownOpen, setHwDropdownOpen] = useState(false);
  const [studioTab] = useState<StudioTabId>("ai");

  const variants = useMemo(() => extractVariantsFromEvents(events), [events]);
  const grouped = useMemo(() => groupVariantsByLetter(variants), [variants]);
  const sortedGrouped = useMemo(() => sortGrouped(grouped), [grouped]);
  const hasLayouts = sortedGrouped.length > 0;
  const isGenerating = phase === "generating";

  const hardwareTypes = useMemo(() => {
    const set = new Set<string>();
    for (const v of variants) set.add(v.hardware_type);
    return Array.from(set);
  }, [variants]);

  const isLcd = activeHardware
    ? studioHardwareIsLcd(activeHardware)
    : false;

  useEffect(() => {
    if (hardwareTypes.length > 0 && !activeHardware) {
      setActiveHardware(hardwareTypes[0]);
    }
  }, [hardwareTypes, activeHardware]);

  useEffect(() => {
    if (
      sortedGrouped.length > 0 &&
      !sortedGrouped.some((g) => g.variantId === selectedVariant)
    ) {
      setSelectedVariant(sortedGrouped[0].variantId);
    }
  }, [sortedGrouped, selectedVariant]);

  useEffect(() => {
    if (phase === "preview" || phase === "submitted") {
      refetchCampaign();
    }
  }, [phase, refetchCampaign]);

  useEffect(() => {
    if (!isRefining) return;
    const since = chatLayoutSinceMsRef.current;
    const hasNewLayout = events.some(
      (e) =>
        (e.event_type === "layout_refined" || e.event_type === "layout_generated") &&
        new Date(e.created_at).getTime() >= since - 3_000,
    );
    if (hasNewLayout) {
      setIsRefining(false);
      setImageCacheBuster(Date.now());
    }
  }, [events, isRefining]);

  const previewUrl = useMemo(
    () =>
      variantPreviewUrl(
        sortedGrouped,
        selectedVariant,
        activeHardware,
        API_BASE,
        imageCacheBuster,
      ),
    [sortedGrouped, selectedVariant, activeHardware, imageCacheBuster],
  );

  const primarySku = campaign?.rawSkus?.[0];
  const eslPlaceholders = useMemo(
    () => ({
      name: primarySku?.product_name ?? "",
      price:
        primarySku?.proposed_price != null
          ? `$${primarySku.proposed_price.toFixed(2)}`
          : "",
      was:
        primarySku?.current_price != null
          ? `$${primarySku.current_price.toFixed(2)}`
          : "",
      offer_label: primarySku?.offer_label ?? "",
    }),
    [primarySku],
  );

  const chatMutation = usePostCampaignChat();
  const submitMutation = useSubmitCampaign();

  const handleChatSend = useCallback(
    (message: string) => {
      setIsRefining(true);
      chatMutation.mutate(
        {
          campaignId,
          payload: { message, variant_id: selectedVariant },
        },
        {
          onSuccess: () => {
            chatLayoutSinceMsRef.current = Date.now();
            startPolling();
          },
          onError: () => {
            setIsRefining(false);
            toast({
              title: "Refinement failed",
              description: "Could not send your refinement. Please try again.",
              variant: "destructive",
            });
          },
        },
      );
    },
    [campaignId, selectedVariant, chatMutation, startPolling],
  );

  const handleSubmitForApproval = useCallback(() => {
    submitMutation.mutate(
      {
        id: campaignId,
        payload: {
          selected_variant_id: selectedVariant,
          schedule_type: "immediate",
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Sent for approval",
            description: `Variant ${selectedVariant} has been submitted for checker review.`,
          });
          navigate({ to: "/maker/dashboard" });
        },
        onError: () => {
          toast({
            title: "Submit failed",
            description: "Could not submit for approval. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  }, [campaignId, selectedVariant, submitMutation, navigate]);

  const errorEvent = useMemo(
    () => events.find((e) => e.event_type === "error"),
    [events],
  );

  const submittedVariantId = useMemo(
    () => getSubmittedVariantId(events),
    [events],
  );

  const headerSubtitle = isLcd
    ? "LCD Banner · full colour design"
    : "ESL · e-ink design";

  return (
    <div className="flex h-full flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out] bg-ithina-sidebar">
      <header className="flex shrink-0 items-center justify-between border-b border-ithina-border bg-ithina-bg/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/maker/wizard" })}
            className="flex size-8 items-center justify-center rounded-lg border border-ithina-border text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              isLcd
                ? "bg-amber-400/15 text-amber-400"
                : "bg-ithina-purple/15 text-ithina-purple",
            )}
          >
            {isLcd ? (
              <RectangleHorizontal className="size-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <Monitor className="size-4" strokeWidth={1.5} aria-hidden />
            )}
          </div>
          <div>
            <p className="text-base font-bold text-white">Campaign Studio</p>
            <p className="text-[10px] text-slate-500">{headerSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasLayouts && hardwareTypes.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setHwDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-ithina-border bg-ithina-bg px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/20"
              >
                Target: {activeHardware}
                <ChevronDown className="size-3" />
              </button>
              {hwDropdownOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-ithina-border bg-ithina-panel py-1 shadow-xl">
                  {hardwareTypes.map((hw) => (
                    <button
                      key={hw}
                      type="button"
                      onClick={() => {
                        setActiveHardware(hw);
                        setHwDropdownOpen(false);
                      }}
                      className={cn(
                        "block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/5",
                        hw === activeHardware
                          ? "text-ithina-purple"
                          : "text-slate-400",
                      )}
                    >
                      {hw}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 text-[11px] text-ithina-purple">
              <Sparkles className="size-3.5 shrink-0" />
              <span>AI is designing your layouts…</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {phase === "submitted" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex size-20 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
              <Send className="size-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-white">
                Campaign submitted
              </h2>
              <p className="mx-auto max-w-md text-sm text-slate-400">
                {submittedVariantId
                  ? `Variant ${submittedVariantId} has been sent for approval.`
                  : "This campaign has been sent for approval."}{" "}
                The checker will review and approve it shortly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/maker/campaigns" })}
              className="rounded-lg bg-ithina-purple px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover"
            >
              Back to campaigns
            </button>
          </div>
        )}

        {phase !== "submitted" && (
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <div className="flex w-56 shrink-0 flex-col border-r border-ithina-border bg-ithina-bg/30">
              <div className="flex-1 space-y-1 p-3">
                <p className="px-2 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-600">
                  Design Method
                </p>
                {STUDIO_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = studioTab === tab.id;
                  const locked = tab.id !== "ai";
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {}}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                        locked && "cursor-not-allowed opacity-45",
                        active && !locked
                          ? "border-ithina-purple/30 bg-ithina-purple/15 font-semibold text-white"
                          : !locked
                            ? "border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white"
                            : "border-transparent text-slate-500",
                      )}
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-ithina-border/60 p-4">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-slate-600">
                  Live Preview
                </p>
                {previewUrl ? (
                  <div
                    className={cn(
                      "mx-auto overflow-hidden rounded-[5px] border-2 bg-black/20",
                      isLcd
                        ? "aspect-video max-w-[136px] border-slate-600"
                        : "max-w-[108px] border-slate-400",
                    )}
                  >
                    <img
                      key={previewUrl}
                      src={previewUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                ) : isLcd ? (
                  <LcdLivePreview />
                ) : (
                  <EslLivePreview variant={abcVariant(selectedVariant)} />
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {studioTab === "ai" && (
                <>
                  <div className="flex min-h-0 flex-1 overflow-hidden">
                    <div className="min-h-0 flex-1 overflow-y-auto p-5">
                      {phase === "failed" && (
                        <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                          <p className="font-semibold text-rose-100">
                            Layout generation failed
                          </p>
                          <p className="mt-1 text-rose-200/90">
                            {errorEvent?.message ??
                              "An error occurred while generating layouts. Go back and try again."}
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate({ to: "/maker/wizard" })}
                            className="mt-3 rounded-lg border border-ithina-border px-3 py-1.5 text-[11px] font-medium text-slate-200 transition-colors hover:bg-white/5"
                          >
                            Back to wizard
                          </button>
                        </div>
                      )}

                      {isReadOnlySubmitted && hasLayouts && (
                        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                          {submittedVariantId
                            ? `Variant ${submittedVariantId} is submitted for approval. Preview is read-only.`
                            : "Campaign is submitted for approval. Preview is read-only."}
                        </div>
                      )}

                      {phase !== "failed" && (
                        <>
                          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                            Select a layout variant
                          </p>
                          <div
                            className={cn(
                              isLcd ? "flex flex-col gap-3" : "grid grid-cols-3 gap-4",
                            )}
                          >
                            {ESL_VARIANTS.map((v) => {
                              const url = variantPreviewUrl(
                                sortedGrouped,
                                v.id,
                                activeHardware,
                                API_BASE,
                                imageCacheBuster,
                              );
                              const variantLayout = sortedGrouped
                                .find((g) => g.variantId === v.id)
                                ?.images[activeHardware];
                              return isLcd ? (
                                <LcdVariantCard
                                  key={v.id}
                                  v={v}
                                  selected={selectedVariant === v.id}
                                  onSelect={() => setSelectedVariant(v.id)}
                                  previewImageUrl={url}
                                  isScanning={isRefining && selectedVariant === v.id}
                                />
                              ) : (
                                <EslVariantCard
                                  key={v.id}
                                  v={v}
                                  selected={selectedVariant === v.id}
                                  onSelect={() => setSelectedVariant(v.id)}
                                  previewImageUrl={url}
                                  isScanning={isRefining && selectedVariant === v.id}
                                  hardwareType={activeHardware || "chroma29"}
                                  elements={variantLayout?.elements ?? null}
                                  placeholders={eslPlaceholders}
                                />
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    <AiModifyPanel
                      resetKey={campaignId}
                      live={{
                        disabled:
                          submitMutation.isPending ||
                          isReadOnlySubmitted ||
                          !hasLayouts,
                        isRefining,
                        onSend: handleChatSend,
                      }}
                    />
                  </div>

                  <div className="flex shrink-0 items-center justify-between border-t border-ithina-border bg-ithina-bg/40 px-5 py-3">
                    <p className="text-xs text-slate-500">
                      Variant{" "}
                      <span className="font-semibold text-white">
                        {selectedVariant}
                      </span>{" "}
                      selected
                    </p>
                    {!isReadOnlySubmitted && (
                      <button
                        type="button"
                        onClick={handleSubmitForApproval}
                        disabled={submitMutation.isPending || !hasLayouts}
                        className="flex items-center gap-2 rounded-xl bg-ithina-purple px-5 py-2 text-sm font-bold text-white transition-all hover:bg-ithina-purple-hover disabled:opacity-50"
                      >
                        Apply to Campaign
                        <Check className="size-4" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
