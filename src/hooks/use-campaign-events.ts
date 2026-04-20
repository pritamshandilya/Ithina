import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCampaignTimeline,
  normalizeCampaignEventsPayload,
} from "@/services/campaigns";
import type { ApiCampaignEventResponse } from "@/types/api/campaigns";

import { campaignKeys } from "./use-campaigns";

export interface UseCampaignEventsContext {
  events: ApiCampaignEventResponse[];
  apiStatus: string | undefined;
}

export interface UseCampaignEventsOptions {
  /** Polling interval in ms (default 2500). */
  intervalMs?: number;
  /** When false, polling does not start automatically. Default true. */
  initialPolling?: boolean;
  /** Campaign status from `useCampaign` — included in `shouldStop` context. */
  apiStatus?: string | null | undefined;
  /**
   * When this returns true after a successful fetch, polling stops and `onAutoStop` runs once.
   * Use for terminal pipeline events (`campaign_published`, etc.).
   */
  shouldStop?: (ctx: UseCampaignEventsContext) => boolean;
  /** Fired once when `shouldStop` becomes true (after stopping polling). */
  onAutoStop?: (ctx: UseCampaignEventsContext) => void;
}

/**
 * Reusable campaign timeline polling for the Promo Assistant pipeline.
 *
 * - `startPolling` / `stopPolling` — imperative control
 * - `refetchInterval` only while `isPolling` is true (saves traffic when idle)
 * - Auto-stop when `shouldStop` returns true (e.g. `campaign_published`)
 *
 * The query stays `enabled` whenever `campaignId` is set so cached events remain available after stop.
 */
export function useCampaignEvents(
  campaignId: string,
  options: UseCampaignEventsOptions = {},
) {
  const {
    intervalMs = 2_500,
    initialPolling = true,
    apiStatus,
    shouldStop,
    onAutoStop,
  } = options;

  const [isPolling, setIsPolling] = useState(
    () => Boolean(campaignId) && initialPolling !== false,
  );

  const shouldStopRef = useRef(shouldStop);
  shouldStopRef.current = shouldStop;
  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;
  const firedAutoStopRef = useRef(false);

  useEffect(() => {
    firedAutoStopRef.current = false;
    setIsPolling(Boolean(campaignId) && initialPolling !== false);
  }, [campaignId, initialPolling]);

  const startPolling = useCallback(() => {
    firedAutoStopRef.current = false;
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => setIsPolling(false), []);

  const query = useQuery({
    queryKey: [...campaignKeys.timeline(campaignId), "eventsPoll"],
    queryFn: () => getCampaignTimeline(campaignId),
    enabled: Boolean(campaignId),
    refetchInterval: isPolling && Boolean(campaignId) ? intervalMs : false,
    staleTime: 0,
    gcTime: 5 * 60_000,
    retry: 2,
    retryDelay: 1_000,
  });

  const events = normalizeCampaignEventsPayload(query.data);

  useEffect(() => {
    if (!campaignId || !isPolling) return;
    const fn = shouldStopRef.current;
    if (!fn) return;
    const ctx: UseCampaignEventsContext = {
      events,
      apiStatus: apiStatus ?? undefined,
    };
    if (!fn(ctx)) return;
    setIsPolling(false);
    if (!firedAutoStopRef.current) {
      firedAutoStopRef.current = true;
      onAutoStopRef.current?.(ctx);
    }
  }, [campaignId, isPolling, events, apiStatus]);

  return {
    events,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    isPolling,
    startPolling,
    stopPolling,
  };
}
