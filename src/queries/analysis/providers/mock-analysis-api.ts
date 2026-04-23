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

interface MockPlanogramRecord {
  id: string;
  payload: PlanogramPayload;
}

function toSummary(record: MockPlanogramRecord): PlanogramSummary {
  return {
    id: record.id,
    name: record.payload.name,
    version: record.payload.version,
    description: record.payload.description,
    status: record.payload.status,
    shelfCount: record.payload.shelves.length,
    productCount: record.payload.shelves.reduce(
      (sum, shelf) => sum + shelf.products.length,
      0,
    ),
    dimensions: `${record.payload.fixture.width}×${record.payload.fixture.height}×${record.payload.fixture.depth}`,
    width: record.payload.fixture.width,
    height: record.payload.fixture.height,
    depth: record.payload.fixture.depth,
  };
}

export const mockAnalysisApiClient: AnalysisApiClient = {
  async fetchAdhocAnalyses({ storeId }: FetchAdhocAnalysesParams) {
    await simulateNetworkDelay(300);
    return generateMockAdhocAnalyses(storeId);
  },
  async fetchPlanogramList(_storeId?: string): Promise<PlanogramSummary[]> {
    await simulateNetworkDelay(300);
    return allPlanogramPayloads().map(toSummary);
  },
  async fetchPlanogramById(id: string): Promise<PlanogramPayload | null> {
    await simulateNetworkDelay(200);
    return allPlanogramPayloads().find((record) => record.id === id)?.payload ?? null;
  },
  async savePlanogramPayload(payload: PlanogramPayload): Promise<PlanogramPayload> {
    await simulateNetworkDelay(350);
    const recordId = findExistingRecordId(payload) ?? `planogram-${Date.now()}`;
    const next = customPlanograms.filter((record) => record.id !== recordId);
    next.push({ id: recordId, payload });
    customPlanograms = next;
    return payload;
  },
  async deletePlanogram(id: string): Promise<boolean> {
    await simulateNetworkDelay(250);
    const before = customPlanograms.length;
    customPlanograms = customPlanograms.filter((record) => record.id !== id);
    return customPlanograms.length < before;
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

const PLANOGRAMS: MockPlanogramRecord[] = [
  { id: "PLN-SHELF-POC-001", payload: PLANOGRAM_POC_001 },
  { id: "PLN-SHELF-POC-002", payload: PLANOGRAM_POC_002 },
];

let customPlanograms: MockPlanogramRecord[] = [];

function allPlanogramPayloads(): MockPlanogramRecord[] {
  const overridden = new Set(customPlanograms.map((record) => record.id));
  return [
    ...customPlanograms,
    ...PLANOGRAMS.filter((record) => !overridden.has(record.id)),
  ];
}

function findExistingRecordId(payload: PlanogramPayload): string | null {
  const existing = allPlanogramPayloads().find(
    (record) =>
      record.payload.name === payload.name &&
      record.payload.version === payload.version,
  );
  return existing?.id ?? null;
}

const createdPlanogramShelves: Shelf[] = [];

const assignPlanogramOverlays = new Map<
  string,
  { planogramId: string; arrangement: PlanogramArrangement }
>();
