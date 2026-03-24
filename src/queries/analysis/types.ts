import type { AdhocAnalysis } from "@/types/maker";
import type { PlanogramArrangement, PlanogramPayload, PlanogramSummary } from "@/types/planogram";
import type { Shelf } from "@/types/maker";

export type AnalysisApiMode = "mock" | "live";

export interface FetchAdhocAnalysesParams {
  storeId?: string;
}

export interface AnalysisApiClient {
  fetchAdhocAnalyses(params: FetchAdhocAnalysesParams): Promise<AdhocAnalysis[]>;
  fetchPlanogramList(storeId?: string): Promise<PlanogramSummary[]>;
  fetchPlanogramById(id: string): Promise<PlanogramPayload | null>;
  saveShelfArrangement(
    shelfName: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
    storeId: string,
  ): Promise<Shelf>;
  assignPlanogramToShelf(
    shelfId: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null>;
  updateShelfArrangement(
    shelfId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null>;
  getCreatedPlanogramShelves(): Shelf[];
  getAssignPlanogramOverlays(): Map<
    string,
    { planogramId: string; arrangement: PlanogramArrangement }
  >;
}

