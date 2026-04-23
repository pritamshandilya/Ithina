import type { AdhocAnalysis } from "@/types/maker";
import type { PlanogramArrangement, PlanogramPayload, PlanogramSummary } from "@/types/planogram";
import type { Shelf } from "@/types/maker";
import { mockAnalysisApiClient } from "./mock-analysis-api";
import { fetchAdhocAnalysesForStore } from "@/queries/maker/api/analysis";

import type { AnalysisApiClient, FetchAdhocAnalysesParams } from "../types";

/**
 * Live analysis API provider.
 * Keep endpoint mapping localized here so backend API rollout only requires
 * updates in this file.
 */
export const liveAnalysisApiClient: AnalysisApiClient = {
  async fetchAdhocAnalyses({
    storeId,
  }: FetchAdhocAnalysesParams): Promise<AdhocAnalysis[]> {
    return fetchAdhocAnalysesForStore(storeId);
  },
  async fetchPlanogramList(storeId?: string): Promise<PlanogramSummary[]> {
    void storeId;
    return [];
  },
  async fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
    void id;
    return null;
  },
  async saveShelfArrangement(
    shelfName: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
    storeId: string,
  ): Promise<Shelf> {
    return mockAnalysisApiClient.saveShelfArrangement(
      shelfName,
      planogramId,
      arrangement,
      storeId,
    );
  },
  async assignPlanogramToShelf(
    shelfId: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    return mockAnalysisApiClient.assignPlanogramToShelf(
      shelfId,
      planogramId,
      arrangement,
    );
  },
  async updateShelfArrangement(
    shelfId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    return mockAnalysisApiClient.updateShelfArrangement(shelfId, arrangement);
  },
  getCreatedPlanogramShelves(): Shelf[] {
    return mockAnalysisApiClient.getCreatedPlanogramShelves();
  },
  getAssignPlanogramOverlays(): Map<
    string,
    { planogramId: string; arrangement: PlanogramArrangement }
  > {
    return mockAnalysisApiClient.getAssignPlanogramOverlays();
  },
  async savePlanogramPayload(payload: PlanogramPayload): Promise<PlanogramPayload> {
    void payload;
    throw new Error(
      "Saving planogram payload via analysis provider is not available because the backend endpoint is not implemented.",
    );
  },
  async deletePlanogram(id: string): Promise<boolean> {
    void id;
    return false;
  },
};

