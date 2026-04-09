import { getAnalysisApiMode } from "./config";
import { liveAnalysisApiClient } from "./providers/live-analysis-api";
import { mockAnalysisApiClient } from "./providers/mock-analysis-api";
import type { AnalysisApiClient } from "./types";

let cachedAnalysisApiClient: AnalysisApiClient | null = null;

export function getAnalysisApiClient(): AnalysisApiClient {
  if (cachedAnalysisApiClient) return cachedAnalysisApiClient;

  const mode = getAnalysisApiMode();
  cachedAnalysisApiClient = mode === "live" ? liveAnalysisApiClient : mockAnalysisApiClient;
  return cachedAnalysisApiClient;
}

export type { AnalysisApiClient, AnalysisApiMode, FetchAdhocAnalysesParams } from "./types";

