import { generateMockAdhocAnalyses } from "@/lib/api/mock-data";
import { PLANOGRAM_POC_001, PLANOGRAM_POC_002 } from "@/lib/api/planogram-sample";
import type {
  PlanogramArrangement,
  PlanogramPayload,
  PlanogramSummary,
} from "@/types/planogram";
import type { Shelf } from "@/types/maker";

import type { AnalysisApiClient, FetchAdhocAnalysesParams } from "../types";

function simulateNetworkDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockAnalysisApiClient: AnalysisApiClient = {
  async fetchAdhocAnalyses({ storeId }: FetchAdhocAnalysesParams) {
    await simulateNetworkDelay(300);
    return generateMockAdhocAnalyses(storeId);
  },
  async fetchPlanogramList(_storeId?: string): Promise<PlanogramSummary[]> {
    await simulateNetworkDelay(300);
    return PLANOGRAMS.map((p) => {
      const { planogram, metadata } = p;
      const fixture = planogram.fixture;
      const loc = planogram.physicalLocation;
      const productCount =
        metadata?.totalSKUs ??
        fixture.shelves.reduce((sum, s) => sum + s.products.length, 0);
      return {
        id: planogram.id,
        name: planogram.name,
        shelfCount: fixture.shelves.length,
        productCount,
        dimensions: `${fixture.width}×${fixture.height} ${planogram.storeConfig?.units ?? "mm"}`,
        location: planogram.location ?? metadata?.location,
        zone: loc?.zone,
        aisle: loc?.aisle,
        bay: loc?.bay,
        section: loc?.section,
        fixtureType: fixture.type,
        fixtureId: fixture.fixtureId,
        width: fixture.width,
        height: fixture.height,
        depth: fixture.depth,
      };
    });
  },
  async fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
    await simulateNetworkDelay(200);
    return PLANOGRAMS.find((p) => p.planogram.id === id) ?? null;
  },
  async saveShelfArrangement(
    shelfName: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
    _storeId: string,
  ): Promise<Shelf> {
    await simulateNetworkDelay(500);
    const shelf: Shelf = {
      id: `shelf-planogram-${Date.now()}`,
      aisleNumber: 1,
      bayNumber: 1,
      aisleCode: "A1",
      bayCode: "1",
      shelfName,
      description: `Planogram: ${planogramId}`,
      status: "never-audited",
      assignedTo: "user-001",
      planogramId,
      arrangement,
    };
    createdPlanogramShelves.push(shelf);
    return shelf;
  },
  async assignPlanogramToShelf(
    shelfId: string,
    planogramId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    await simulateNetworkDelay(400);
    assignPlanogramOverlays.set(shelfId, { planogramId, arrangement });

    const idx = createdPlanogramShelves.findIndex((s) => s.id === shelfId);
    if (idx >= 0) {
      createdPlanogramShelves[idx] = {
        ...createdPlanogramShelves[idx],
        planogramId,
        arrangement,
      };
      return createdPlanogramShelves[idx];
    }

    return { id: shelfId, planogramId, arrangement } as Shelf;
  },
  async updateShelfArrangement(
    shelfId: string,
    arrangement: PlanogramArrangement,
  ): Promise<Shelf | null> {
    await simulateNetworkDelay(400);
    const idx = createdPlanogramShelves.findIndex((s) => s.id === shelfId);
    if (idx < 0) return null;
    createdPlanogramShelves[idx] = {
      ...createdPlanogramShelves[idx],
      arrangement,
    };
    return createdPlanogramShelves[idx];
  },
  getCreatedPlanogramShelves(): Shelf[] {
    return [...createdPlanogramShelves];
  },
  getAssignPlanogramOverlays(): Map<
    string,
    { planogramId: string; arrangement: PlanogramArrangement }
  > {
    return assignPlanogramOverlays;
  },
};

const PLANOGRAMS: PlanogramPayload[] = [PLANOGRAM_POC_001, PLANOGRAM_POC_002];

const createdPlanogramShelves: Shelf[] = [];

const assignPlanogramOverlays = new Map<
  string,
  { planogramId: string; arrangement: PlanogramArrangement }
>();

