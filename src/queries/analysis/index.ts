import { getAnalysisApiMode } from "./config";
import { liveAnalysisApiClient } from "@/lib/api/analysis/liveAnalysisApi";
import { mockAnalysisApiClient } from "@/lib/api/analysis/mockAnalysisApi";
import type { AnalysisApiClient } from "@/lib/api/analysis/types";

let cachedAnalysisApiClient: AnalysisApiClient | null = null;

export function getAnalysisApiClient(): AnalysisApiClient {
  if (cachedAnalysisApiClient) return cachedAnalysisApiClient;

  const mode = getAnalysisApiMode();
  cachedAnalysisApiClient =
    mode === "live" ? liveAnalysisApiClient : mockAnalysisApiClient;
  return cachedAnalysisApiClient;
}

export type {
  AnalysisApiClient,
  AnalysisApiMode,
  FetchAdhocAnalysesParams,
} from "@/lib/api/analysis/types";
