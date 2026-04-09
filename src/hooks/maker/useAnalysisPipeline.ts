/**
 * Reusable analysis pipeline hook for adhoc and planogram-based flows
 *
 * Simulates AI analysis steps. Pauses at Data Enrichment step to allow
 * user to review/adjust SKU metrics before continuing.
 */

import { useCallback, useRef, useState } from "react";

import { PIPELINE_STEPS } from "@/lib/analysis/constants";
import { MOCK_SKU_ENRICHMENT_ITEMS } from "@/lib/analysis/mock-sku-data";
import type { PipelineStepId, SkuEnrichmentItem } from "@/types/analysis/types";

const STEP_INTERVAL_MS = 1500;
const DATA_ENRICHMENT_STEP_ID: PipelineStepId = "input";

export interface UseAnalysisPipelineOptions {
  /** Called when pipeline reaches Data Enrichment – resolve with enriched items to continue */
  onEnrichmentRequired?: (items: SkuEnrichmentItem[]) => Promise<SkuEnrichmentItem[]>;
  /** Called when pipeline completes */
  onComplete?: () => void;
  stepIntervalMs?: number;
}

export interface UseAnalysisPipelineReturn {
  isAnalyzing: boolean;
  currentStep: PipelineStepId | null;
  elapsedSeconds: number;
  analysisComplete: boolean;
  awaitingEnrichment: boolean;
  progressPercent: number;
  currentStepIndex: number;
  pipelineSteps: typeof PIPELINE_STEPS;
  startAnalysis: () => void;
  /** Reset pipeline state so user can run analysis again */
  resetAnalysis: () => void;
}

export function useAnalysisPipeline(
  options: UseAnalysisPipelineOptions = {}
): UseAnalysisPipelineReturn {
  const {
    onEnrichmentRequired,
    onComplete,
    stepIntervalMs = STEP_INTERVAL_MS,
  } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<PipelineStepId | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [awaitingEnrichment, setAwaitingEnrichment] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, []);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setCurrentStep("detection");
    setElapsedSeconds(0);
    setAnalysisComplete(false);
    setAwaitingEnrichment(false);

    const stepIds = PIPELINE_STEPS.map((s) => s.id);
    let stepIndex = 0;

    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const advanceStep = () => {
      stepIndex += 1;
      if (stepIndex < stepIds.length) {
        const nextStep = stepIds[stepIndex]!;
        setCurrentStep(nextStep);

        if (
          nextStep === DATA_ENRICHMENT_STEP_ID &&
          onEnrichmentRequired
        ) {
          clearIntervals();
          setAwaitingEnrichment(true);
          onEnrichmentRequired([...MOCK_SKU_ENRICHMENT_ITEMS])
            .then(() => {
              setAwaitingEnrichment(false);
              stepIndex += 1;
              if (stepIndex < stepIds.length) {
                setCurrentStep(stepIds[stepIndex]!);
                intervalRef.current = setInterval(advanceStep, stepIntervalMs);
              } else {
                finishPipeline();
              }
            })
            .catch(() => {
              setAwaitingEnrichment(false);
              setIsAnalyzing(false);
              setCurrentStep(null);
            });
        }
      } else {
        finishPipeline();
      }
    };

    const finishPipeline = () => {
      clearIntervals();
      setAnalysisComplete(true);
      setIsAnalyzing(false);
      setCurrentStep(null);
      onComplete?.();
    };

    intervalRef.current = setInterval(advanceStep, stepIntervalMs);
  }, [onEnrichmentRequired, onComplete, stepIntervalMs, clearIntervals]);

  const resetAnalysis = useCallback(() => {
    clearIntervals();
    setIsAnalyzing(false);
    setCurrentStep(null);
    setElapsedSeconds(0);
    setAnalysisComplete(false);
    setAwaitingEnrichment(false);
  }, [clearIntervals]);

  const currentStepIndex = currentStep
    ? PIPELINE_STEPS.findIndex((s) => s.id === currentStep)
    : -1;

  const progressPercent =
    currentStep
      ? ((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100
      : analysisComplete
        ? 100
        : 0;

  return {
    isAnalyzing,
    currentStep,
    elapsedSeconds,
    analysisComplete,
    awaitingEnrichment,
    progressPercent,
    currentStepIndex,
    pipelineSteps: PIPELINE_STEPS,
    startAnalysis,
    resetAnalysis,
  };
}
