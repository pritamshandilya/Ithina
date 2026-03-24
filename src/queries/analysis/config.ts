import type { AnalysisApiMode } from "./types";

const DEFAULT_ANALYSIS_API_MODE: AnalysisApiMode = "mock";

export function getAnalysisApiMode(): AnalysisApiMode {
  const rawMode =
    import.meta.env.VITE_API_MODE_ANALYSIS ?? import.meta.env.VITE_API_MODE;
  if (rawMode === "live") return "live";
  return DEFAULT_ANALYSIS_API_MODE;
}

