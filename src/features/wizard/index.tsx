import { AlertTriangle, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activateCampaign,
  activateCampaignWithId,
  setCampaignName,
  setStagedSkus,
} from "@/store/slices/campaign-slice";
import { resetStudio } from "@/store/slices/studio-slice";
import {
  pushMessage as pushWizardMessage,
  removeAllCsvViolations,
  mergeGridData,
  removeCsvRow,
  resetPromoAssistantChat,
  setAllGridRowsIncluded,
  resetWizard,
  setCampaignNamed,
  setCsvConfirmed,
  setCsvFileName,
  setCsvRows,
  setHasSplit,
  setInputMode as setWizardInputMode,
  setShowGrid,
  setWMode,
  setWStep,
  toggleGridRowIncluded,
  updateGridRowDiscount,
} from "@/store/slices/wizard-slice";
import type { HardwareDeviceId } from "@/types/wizard";
import { campaignKeys, useCampaignEvents, usePostCampaignChat, useSubmitCampaign } from "@/hooks/use-campaigns";
import { useConfirmHardwareSelection, useSubmitWizardIntent } from "@/hooks/use-wizard";
import { createCampaignFromWizard, generateCampaign } from "@/services/campaigns";
import { mergeLayoutVariants } from "@/features/campaign-studio/types";
import type { LayoutVariant } from "@/types/api/campaigns";
import { buildChatProductsLabel } from "@/lib/chat-products-label";
import { isPromoDiscoveryQuery } from "@/lib/promo-discovery-intent";
import { datetimeLocalValueToParts, isoToDatetimeLocalValue } from "@/lib/wizard-datetime";
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
import CampaignStudioModal, { type AppliedDesignSelection } from "./components/campaign-studio-modal";
import type { EslPlaceholders } from "@/features/campaign-studio/esl-svg-renderer";
import { defaultPromoApiBase } from "./lib/preview-layout";
import { toast } from "@/hooks/use-toast";

interface CsvRow {
  sku: string;
  name: string;
  current: string;
  proposed: string;
  safe: boolean;
}

// Step 0 = mode chooser, steps 1..N = actual steps
// NL runtime currently implements first 2 steps, but header follows the new 5-step flow shell.
const NL_STEPS = ["Select Products", "Select Screens & Design", "Guard Rails", "Schedule", "Submit"];
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
  /** Last Campaign Studio apply (template/upload) or AI; drives Step 2 preview labels. */
  const [appliedStudioSelection, setAppliedStudioSelection] = useState<AppliedDesignSelection | null>(null);
  const [showStudio, setShowStudio] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<"A" | "B" | "C">("B");
  const [schedule, setSchedule] = useState<{
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    autoApprove: boolean;
  }>({ startDate: "", startTime: "08:00", endDate: "", endTime: "08:00", autoApprove: false });
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
  const campaignActive = useAppSelector((s) => s.campaign.active);
  const campaignIdFromStore = useAppSelector((s) => s.campaign.id);

  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [designGeneratePending, setDesignGeneratePending] = useState(false);
  /** Tracks whether the Campaign Studio modal is in "generating" overlay state */
  const [studioGenerating, setStudioGenerating] = useState(false);
  /** Layout rows merged from timeline events (preserves image_url across partial API payloads) */
  const [generatedVariants, setGeneratedVariants] = useState<LayoutVariant[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  /** Bumped on each layout_refined to cache-bust identical image URLs */
  const [imageCacheBuster, setImageCacheBuster] = useState(0);

  const intentMutation = useSubmitWizardIntent();
  const hwConfirmMutation = useConfirmHardwareSelection();
  const chatMutation = usePostCampaignChat();
  const submitMutation = useSubmitCampaign();

  /** LangGraph thread id from POST /campaigns/draft; required for follow-up turns and generate. */
  const pipelineSessionIdRef = useRef<string | null>(null);

  /**
   * IDs of all events we already knew about at the moment polling was (re-)started.
   * The event handler only reacts to events NOT in this set, preventing stale
   * `layout_generated` results from falsely triggering when polling restarts after
   * a chat message is sent.
   */
  const knownEventIdsAtPollStart = useRef<Set<string>>(new Set());

  /** True while we wait for a layout event after POST /chat (drives AI reply bubble). */
  const expectingChatLayoutEventRef = useRef(false);

  /** Stable ref so async callbacks can read the latest studioEvents without stale closure. */
  const studioEventsRef = useRef<ReturnType<typeof useCampaignEvents>["events"]>([]);

  /**
   * Poll campaign events — NO shouldStop here; we stop manually in the effect below
   * so that restarting polling after chat doesn't immediately quit on old events.
   */
  const {
    events: studioEvents,
    startPolling: startStudioPolling,
    stopPolling: stopStudioPolling,
  } = useCampaignEvents(
    campaignIdFromStore ?? "",
    {
      intervalMs: 2_500,
      initialPolling: false,
    },
  );

  // Keep stable ref in sync with current events (always store a real array)
  useEffect(() => {
    studioEventsRef.current = Array.isArray(studioEvents) ? studioEvents : [];
  }, [studioEvents]);

  const [lastAiResponse, setLastAiResponse] = useState<string | undefined>(undefined);

  useEffect(() => {
    const knownIds = knownEventIdsAtPollStart.current;
    const timeline = Array.isArray(studioEvents) ? studioEvents : [];
    // Only react to events that arrived AFTER this polling cycle started
    const newEvent = [...timeline]
      .reverse()
      .find(
        (e) =>
          !knownIds.has(e.id) &&
          (e.event_type === "layout_generated" ||
            e.event_type === "layout_refined" ||
            e.event_type === "error"),
      );

    if (!newEvent) return;

    stopStudioPolling();

    if (newEvent.event_type === "error") {
      setStudioGenerating(false);
      setIsRefining(false);
      expectingChatLayoutEventRef.current = false;
      return;
    }

    const rawVariants = newEvent.payload_snapshot?.variants;
    if (rawVariants != null) {
      setGeneratedVariants((prev) => mergeLayoutVariants(prev, rawVariants as LayoutVariant[]));
    }
    setStudioGenerating(false);
    setIsRefining(false);
    if (expectingChatLayoutEventRef.current) {
      setImageCacheBuster(Date.now());
      if (newEvent.message && newEvent.message.trim() !== "") {
        setLastAiResponse(newEvent.message);
      }
    }
    expectingChatLayoutEventRef.current = false;
  }, [studioEvents, stopStudioPolling]);

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

  const eslPreviewPlaceholders = useMemo<EslPlaceholders>(
    () => ({
      name: gridData[0]?.name ?? "",
      price: gridData[0]?.proposed != null ? `$${gridData[0].proposed.toFixed(2)}` : "",
      was: gridData[0]?.current != null ? `$${gridData[0].current.toFixed(2)}` : "",
      offer_label: gridData[0]?.offerLabel ?? "",
    }),
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
    setAppliedStudioSelection(null);
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

  const handleAiCampaignNameChange = useCallback(
    (value: string) => {
      if (campaignActive) dispatch(setCampaignName(value));
      else dispatch(activateCampaign(value.trim() || "Promo Campaign"));
    },
    [campaignActive, dispatch],
  );

  const aiScheduleStartLocal = useMemo(() => {
    if (!schedule.startDate?.trim()) return "";
    return `${schedule.startDate}T${(schedule.startTime || "08:00").slice(0, 5)}`;
  }, [schedule.startDate, schedule.startTime]);

  const aiScheduleEndLocal = useMemo(() => {
    if (!schedule.endDate?.trim()) return "";
    const t = (schedule.endTime || schedule.startTime || "08:00").slice(0, 5);
    return `${schedule.endDate}T${t}`;
  }, [schedule.endDate, schedule.endTime, schedule.startTime]);

  const handleAiScheduleStartLocalChange = useCallback((value: string) => {
    const parts = datetimeLocalValueToParts(value);
    if (!parts) {
      setSchedule((s) => ({ ...s, startDate: "", startTime: "08:00" }));
      return;
    }
    setSchedule((s) => ({ ...s, startDate: parts.date, startTime: parts.time }));
  }, []);

  const handleAiScheduleEndLocalChange = useCallback((value: string) => {
    const parts = datetimeLocalValueToParts(value);
    if (!parts) {
      setSchedule((s) => ({ ...s, endDate: "", endTime: s.startTime }));
      return;
    }
    setSchedule((s) => ({ ...s, endDate: parts.date, endTime: parts.time }));
  }, []);

  /** Stable object so memo(DataStagingGrid) skips re-render while typing in chat (avoids table flicker). */
  const aiCampaignToolbarMemo = useMemo(
    () => ({
      campaignName,
      onCampaignNameChange: handleAiCampaignNameChange,
      scheduleStartLocal: aiScheduleStartLocal,
      scheduleEndLocal: aiScheduleEndLocal,
      onScheduleStartLocalChange: handleAiScheduleStartLocalChange,
      onScheduleEndLocalChange: handleAiScheduleEndLocalChange,
    }),
    [
      campaignName,
      handleAiCampaignNameChange,
      aiScheduleStartLocal,
      aiScheduleEndLocal,
      handleAiScheduleStartLocalChange,
      handleAiScheduleEndLocalChange,
    ],
  );

  const handleSubmit = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || intentMutation.isPending) return;

    if (!hasSplit) dispatch(setHasSplit(true));
    setError(null);

    pushMessage({ role: "user", text });
    setInputText("");
    setSuggestions([]);
    setIsTyping(true);

    try {
      const existingSessionId = pipelineSessionIdRef.current;
      const { aiReply, skus, sessionId, draftMeta, suggestions: newSuggestions } = await intentMutation.mutateAsync({
        text,
        constraints,
        ...(existingSessionId ? { sessionId: existingSessionId } : {}),
      });
      pipelineSessionIdRef.current = sessionId;

      if (draftMeta.campaignThemeName) {
        if (campaignActive) dispatch(setCampaignName(draftMeta.campaignThemeName));
        else dispatch(activateCampaign(draftMeta.campaignThemeName));
        dispatch(setCampaignNamed(true));
      } else if (!campaignNamed) {
        generateCampaignName(text);
      }

      if (draftMeta.scheduleStartIso || draftMeta.scheduleEndIso) {
        setSchedule((prev) => {
          const next = { ...prev };
          if (draftMeta.scheduleStartIso) {
            const local = isoToDatetimeLocalValue(draftMeta.scheduleStartIso);
            const p = datetimeLocalValueToParts(local);
            if (p) {
              next.startDate = p.date;
              next.startTime = p.time;
            }
          }
          if (draftMeta.scheduleEndIso) {
            const local = isoToDatetimeLocalValue(draftMeta.scheduleEndIso);
            const p = datetimeLocalValueToParts(local);
            if (p) {
              next.endDate = p.date;
              next.endTime = p.time;
            }
          }
          return next;
        });
      }

      setIsTyping(false);
      setSuggestions(newSuggestions);

      // Staging grid: show for promo-discovery questions ("what promos do we have") or when
      // the draft returns SKUs (campaign build). Avoid opening an empty grid on every turn.
      const openStaging =
        isPromoDiscoveryQuery(text) || skus.length > 0 || (showGrid && gridData.length > 0);
      dispatch(setShowGrid(openStaging));

      const skuRowsForLabel = skus.length > 0 ? skus : gridData;
      const productsLabel = buildChatProductsLabel(skuRowsForLabel);

      const scheduleStartIso =
        draftMeta.scheduleStartIso ??
        (schedule.startDate?.trim()
          ? `${schedule.startDate}T${(schedule.startTime || "08:00").slice(0, 5)}:00`
          : null);
      const scheduleEndIso =
        draftMeta.scheduleEndIso ??
        (schedule.endDate?.trim()
          ? `${schedule.endDate}T${(schedule.endTime || schedule.startTime || "08:00").slice(0, 5)}:00`
          : null);

      const resolvedCampaignName =
        draftMeta.campaignThemeName?.trim() || campaignName?.trim() || null;

      const summaryEnrichment =
        scheduleStartIso || scheduleEndIso || productsLabel || resolvedCampaignName
          ? {
              ...(resolvedCampaignName ? { campaignName: resolvedCampaignName } : {}),
              scheduleStartIso,
              scheduleEndIso,
              ...(productsLabel ? { productsLabel } : {}),
            }
          : undefined;

      pushMessage({
        ...aiReply,
        ...(summaryEnrichment ? { summaryEnrichment } : {}),
      });
      if (skus.length > 0) {
        dispatch(mergeGridData(skus));
      }
    } catch (err) {
      setIsTyping(false);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        pipelineSessionIdRef.current = null;
        setError("Session expired. Your next message will start a fresh draft.");
      } else {
        setError("Failed to process intent. Please try again.");
      }
    }
  }, [
    inputText,
    intentMutation,
    hasSplit,
    constraints,
    showGrid,
    gridData.length,
    pushMessage,
    generateCampaignName,
    dispatch,
    campaignActive,
    campaignNamed,
    campaignName,
    gridData,
    schedule.startDate,
    schedule.startTime,
    schedule.endDate,
    schedule.endTime,
  ]);

  const handleSuggestionClick = useCallback(
    (text: string) => {
      setSuggestions([]);
      setInputText("");
      handleSubmit(text);
    },
    [handleSubmit],
  );

  const handleResetPromoChat = useCallback(() => {
    if (intentMutation.isPending || hwConfirmMutation.isPending) return;
    pipelineSessionIdRef.current = null;
    dispatch(resetPromoAssistantChat());
    dispatch(setCampaignName(""));
    setSchedule({ startDate: "", startTime: "08:00", endDate: "", endTime: "08:00", autoApprove: false });
    setInputText("");
    setSuggestions([]);
    setIsTyping(false);
    setError(null);
  }, [dispatch, intentMutation.isPending, hwConfirmMutation.isPending]);

  const handleNlNextFromScreens = useCallback(() => {
    dispatch(setWStep(3));
  }, [dispatch]);

  /**
   * Step 2 — "Configure Design":
   *   1. POST /campaigns/generate  →  202 Accepted
   *   2. Open Campaign Studio modal immediately (generating overlay visible)
   *   3. Poll /events until layout_generated fires, then reveal variant cards
   */
  const handleNlConfigureDesign = useCallback(async () => {
    const hardwareTargetsForApi = buildHardwareTargetsForApi();
    if (hardwareTargetsForApi.length === 0) {
      setError("Select at least one hardware target and size before generating layouts.");
      return;
    }

    // Re-open studio for an already-generated campaign
    if (campaignIdFromStore) {
      setShowStudio(true);
      return;
    }

    if (!pipelineSessionIdRef.current) {
      setError("Complete Step 1 chat first so a draft session exists, then try again.");
      return;
    }

    setDesignGeneratePending(true);
    setError(null);
    try {
      const name = campaignName?.trim() || undefined;
      const created = await generateCampaign({
        session_id: pipelineSessionIdRef.current,
        hardware_targets: hardwareTargetsForApi,
        ...(name ? { name } : {}),
      });
      dispatch(activateCampaignWithId({ id: created.id, name: created.name }));
      await queryClient.invalidateQueries({ queryKey: campaignKeys.list });

      // Open the modal in "generating" mode — event polling starts immediately.
      // Snapshot the IDs of any existing events so the effect only reacts to NEW ones.
      knownEventIdsAtPollStart.current = new Set(studioEventsRef.current.map((e) => e.id));
      setGeneratedVariants([]);
      setStudioGenerating(true);
      setShowStudio(true);
      startStudioPolling();
    } catch {
      setError("Failed to generate layouts. Check your connection and try again.");
    } finally {
      setDesignGeneratePending(false);
    }
  }, [
    buildHardwareTargetsForApi,
    campaignIdFromStore,
    campaignName,
    dispatch,
    queryClient,
    startStudioPolling,
  ]);

  const handleNlNextFromGuardRails = useCallback(() => {
    dispatch(setWStep(4));
  }, [dispatch]);

  const handleNlNextFromSchedule = useCallback(
    (payload: { startDate: string; startTime: string; endDate: string; autoApprove: boolean }) => {
      setSchedule({
        startDate: payload.startDate,
        startTime: payload.startTime,
        endDate: payload.endDate,
        endTime: payload.startTime,
        autoApprove: payload.autoApprove,
      });
      dispatch(setWStep(5));
    },
    [dispatch],
  );

  // ── Step 5: Send for Approval ─────────────────────────────────────
  const handleNlSubmit = useCallback(() => {
    if (!campaignIdFromStore) {
      setError("No campaign found. Please complete the wizard from the beginning.");
      return;
    }
    const scheduleType = schedule.startDate?.trim() ? "scheduled" : "immediate";
    submitMutation.mutate(
      {
        id: campaignIdFromStore,
        payload: {
          selected_variant_id: selectedVariant,
          schedule_type: scheduleType,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Sent for Approval",
            description: `Variant ${selectedVariant} is now pending review by the approver.`,
          });
          dispatch(resetWizard());
          dispatch(resetStudio());
          navigate({ to: "/maker/dashboard" });
        },
        onError: () => {
          toast({
            title: "Submission failed",
            description: "Could not send the campaign for approval. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  }, [
    campaignIdFromStore,
    selectedVariant,
    schedule.startDate,
    submitMutation,
    dispatch,
    navigate,
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
        schedule: { startDate: "", startTime: "08:00", endDate: "", endTime: "08:00" },
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
  const handleSetAllGridRowsIncluded = useCallback(
    (included: boolean) => dispatch(setAllGridRowsIncluded(included)),
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

  // ── Studio: chat send handler ─────────────────────────────────────
  const handleStudioChatSend = useCallback(
    (message: string) => {
      if (!campaignIdFromStore) return;
      setIsRefining(true);
      chatMutation.mutate(
        {
          campaignId: campaignIdFromStore,
          payload: { message, variant_id: selectedVariant },
        },
        {
          onSuccess: () => {
            expectingChatLayoutEventRef.current = true;
            // Snapshot known IDs BEFORE restarting polling so the event effect
            // won't falsely stop on the already-seen layout_generated event.
            knownEventIdsAtPollStart.current = new Set(
              studioEventsRef.current.map((e) => e.id),
            );
            startStudioPolling();
          },
          onError: () => {
            expectingChatLayoutEventRef.current = false;
            setIsRefining(false);
            toast({ title: "Refinement failed", description: "Please try again.", variant: "destructive" });
          },
        },
      );
    },
    [campaignIdFromStore, selectedVariant, chatMutation, startStudioPolling],
  );

  // ── Studio: Apply to Campaign (draft) — continue wizard; do not POST /submit here ──
  const handleStudioApplyToCampaign = useCallback(
    (variantId: string) => {
      const v =
        variantId === "A" || variantId === "B" || variantId === "C" ? variantId : selectedVariant;
      stopStudioPolling();
      expectingChatLayoutEventRef.current = false;
      setIsRefining(false);
      setStudioGenerating(false);
      setSelectedVariant(v);
      setDesignConfigured(true);
      setAppliedStudioSelection({ source: "ai" });
      setShowStudio(false);
      toast({
        title: "Design applied",
        description: `Variant ${v} is saved on this draft. Continue to Guard Rails when ready.`,
      });
    },
    [selectedVariant, stopStudioPolling],
  );

  // ── Proceed button visibility for NL step 1 ────────────────────────
  const canProceedNl =
    (inputMode === "ai" && (gridData.length === 0 || includedGridSkuCount > 0)) ||
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
              trailingSlot={
                wStep === 1 && wMode === "nl" && canProceedNl ? (
                  <button
                    type="button"
                    onClick={() => dispatch(setWStep(2))}
                    disabled={hwConfirmMutation.isPending}
                    className="flex shrink-0 items-center gap-2 rounded-lg bg-ithina-purple px-4 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:bg-ithina-purple-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next: Select Screens & Design
                    <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                  </button>
                ) : null
              }
            />

            {/* ── NL Step 1: Intent & Data Staging ── */}
            {wStep === 1 && wMode === "nl" && (
              <div className="flex flex-1 min-h-0 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-1 flex-col overflow-y-auto">
                  {/* Pre-submit: centred zero state */}
                  {!hasSplit && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-5 sm:p-6 animate-[fadeIn_0.4s_ease-out]">
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
                    <div
                      className={
                        inputMode === "csv"
                          ? "flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-auto px-4 pb-4 pt-3 sm:px-5"
                          : "flex min-h-0 flex-1 gap-2 overflow-hidden px-3 pb-3 pt-2 sm:px-4"
                      }
                    >
                      {inputMode === "csv" ? (
                        <DataStagingGrid
                          data={gridData}
                          isGenerating={hwConfirmMutation.isPending}
                          inputMode={inputMode}
                          onInputModeChange={handleInputModeChange}
                          onToggleGridRowIncluded={handleToggleGridRowIncluded}
                          onSetAllGridRowsIncluded={handleSetAllGridRowsIncluded}
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
                          <div className="flex min-h-0 w-[32%] min-w-[220px] max-w-[400px] shrink-0 flex-col">
                            <ChatPanel
                              messages={messages}
                              isTyping={isTyping}
                              inputText={inputText}
                              onInputChange={setInputText}
                              onSubmit={handleSubmit}
                              onResetChat={handleResetPromoChat}
                              inputDisabled={intentMutation.isPending || hwConfirmMutation.isPending}
                              hasSplit={true}
                              suggestions={suggestions}
                              onSuggestionClick={handleSuggestionClick}
                            />
                          </div>
                          {showGrid ? (
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" data-staging-section>
                              <DataStagingGrid
                                data={gridData}
                                isGenerating={hwConfirmMutation.isPending}
                                inputMode={inputMode}
                                onInputModeChange={handleInputModeChange}
                                onToggleGridRowIncluded={handleToggleGridRowIncluded}
                                onSetAllGridRowsIncluded={handleSetAllGridRowsIncluded}
                                onDiscountChange={handleDiscountChange}
                                csvRows={csvRows}
                                csvFileName={csvFileName}
                                onCsvParsed={handleCsvParsed}
                                onCsvClear={handleCsvClear}
                                onCsvConfirm={handleCsvConfirm}
                                onRemoveCsvRow={handleRemoveCsvRow}
                                onRemoveAllViolations={handleRemoveAllViolations}
                                marginFloor={marginFloor}
                                aiCampaignToolbar={aiCampaignToolbarMemo}
                              />
                            </div>
                          ) : (
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ithina-border bg-ithina-panel">
                              <svg className="size-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
                              </svg>
                              <p className="text-xs text-slate-600">SKU staging grid will appear here after AI response</p>
                            </div>
                          )}
                        </>
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
                onConfigureDesign={handleNlConfigureDesign}
                isGeneratingLayouts={designGeneratePending}
                selectedDesign={appliedStudioSelection}
                generatedVariants={generatedVariants}
                eslPreviewPlaceholders={eslPreviewPlaceholders}
                imageCacheBuster={imageCacheBuster}
                apiBaseUrl={defaultPromoApiBase()}
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
                isSubmitting={submitMutation.isPending}
                dataSourceLabel={inputMode === "csv" ? "CSV Upload" : "NL / AI Assisted"}
                skuCount={inputMode === "csv" ? csvRows.length : includedGridSkuCount}
                scheduleDateLabel={formatWizardScheduleDate(schedule.startDate) || "Immediate"}
                scheduleTimeLabel={schedule.startTime || "08:00"}
                scheduleEndLabel={
                  schedule.endDate?.trim()
                    ? `${formatWizardScheduleDate(schedule.endDate)} · ${schedule.endTime || schedule.startTime || "08:00"}`
                    : undefined
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

      {/* ── Campaign Studio Modal ──────────────────────────────────── */}
      <CampaignStudioModal
        open={showStudio}
        onClose={() => setShowStudio(false)}
        mode={
          selectedDevices.includes("lcd") && !selectedDevices.includes("chroma42")
            ? "lcd"
            : "esl"
        }
        selectedVariant={selectedVariant}
        onSelectVariant={setSelectedVariant}
        onApply={(selection) => {
          setDesignConfigured(true);
          setAppliedStudioSelection(selection);
          setShowStudio(false);
          if (selection.source !== "ai") {
            toast({ title: "Design applied", description: `Template "${selection.templateName ?? "custom"}" applied.` });
          }
        }}
        isGenerating={studioGenerating}
        generatedVariants={generatedVariants}
        imageCacheBuster={imageCacheBuster}
        isRefining={isRefining}
        onSendChat={handleStudioChatSend}
        lastAiResponse={lastAiResponse}
        onSubmitForApproval={handleStudioApplyToCampaign}
        placeholders={eslPreviewPlaceholders}
      />
    </>
  );
}
