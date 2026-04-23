import type {
  PlanogramArrangement,
  PlanogramPayload,
  PlanogramProduct,
  PlanogramShelfDef,
} from "@/types/planogram";
import {
  applyArrangementToPlanogram,
  clonePlanogramShelves,
} from "./planogram-schema";

export function deepCopyShelves(shelves: PlanogramShelfDef[]): PlanogramShelfDef[] {
  return clonePlanogramShelves(shelves);
}

export function applyArrangementToFixtureShelves(
  fixtureShelves: PlanogramShelfDef[],
  arrangement: PlanogramArrangement | undefined,
): { shelves: PlanogramShelfDef[]; removed: PlanogramProduct[] } {
  const payload: PlanogramPayload = {
    name: "",
    version: null,
    status: "DRAFT",
    fixture: { width: 0, height: 0, depth: 0 },
    shelves: fixtureShelves,
  };

  return applyArrangementToPlanogram(payload, arrangement);
}
