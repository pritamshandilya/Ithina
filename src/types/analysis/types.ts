/**
 * Shared types for audit analysis pipeline (adhoc and planogram-based)
 */

export interface SkuEnrichmentItem {
  id: string;
  productName: string;
  contribution: number;
  weight: number;
}

/** Issue detail shown when hovering over an issue badge in the SKU list */
export interface SkuIssueDetail {
  type: string;
  description: string;
  reason: string;
}

export type PipelineStepId =
  | "detection"
  | "rows"
  | "recogn"
  | "input"
  | "mapping"
  | "report";

export interface AnalysisPipelineState {
  isAnalyzing: boolean;
  currentStep: PipelineStepId | null;
  elapsedSeconds: number;
  analysisComplete: boolean;
  /** When true, pipeline is paused at Data Enrichment step awaiting user input */
  awaitingEnrichment: boolean;
}

export interface UseAnalysisPipelineOptions {
  /** Called when pipeline reaches Data Enrichment step – return enriched items to continue */
  onEnrichmentRequired?: (items: SkuEnrichmentItem[]) => Promise<SkuEnrichmentItem[]>;
  /** Called when pipeline completes */
  onComplete?: () => void;
  /** Interval in ms between steps (default 1500) */
  stepIntervalMs?: number;
}
