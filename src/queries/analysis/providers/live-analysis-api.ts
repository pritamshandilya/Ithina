import { apiClient } from "@/queries/shared";
import type { AdhocAnalysis } from "@/types/maker";
import type { PlanogramArrangement, PlanogramPayload, PlanogramSummary } from "@/types/planogram";
import type { Shelf } from "@/types/maker";

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
    return apiClient.get<AdhocAnalysis[]>("/maker/adhoc-analyses", {
      storeId,
    });
  },
  async fetchPlanogramList(storeId?: string): Promise<PlanogramSummary[]> {
    return apiClient.get<PlanogramSummary[]>("/maker/planograms", { storeId });
  },
  async fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
    return apiClient.get<PlanogramPayload>(`/maker/planograms/${id}`);
  },
  async saveShelfArrangement(
    shelfName: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
    storeId: string,
  ): Promise<Shelf> {
    return apiClient.post<Shelf>("/maker/planograms/shelf-arrangements", {
      shelfName,
      planogramId,
      arrangement,
      storeId,
    });
  },
  async assignPlanogramToShelf(
    shelfId: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    return apiClient.post<Shelf>(`/maker/shelves/${shelfId}/planogram-assignment`, {
      planogramId,
      arrangement,
    });
  },
  async updateShelfArrangement(
    shelfId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    return apiClient.put<Shelf>(`/maker/shelves/${shelfId}/arrangement`, {
      arrangement,
    });
  },
  getCreatedPlanogramShelves(): Shelf[] {
    return [];
  },
  getAssignPlanogramOverlays(): Map<
    string,
    { planogramId: string; arrangement: PlanogramArrangement }
  > {
    return new Map();
  },
};

