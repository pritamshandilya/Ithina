import type {
  ImageComparisonData,
  PlanogramSlot,
} from "./imageComparisonTypes";
import {
  getPlanogramProductId,
  getShelfDisplayLabel,
  sortPlanogramProducts,
  sortPlanogramShelves,
} from "@/lib/planogram/planogramSchema";
import type { PlanogramPayload } from "@/types/planogram";

const SHAPE_BY_CATEGORY: Record<string, PlanogramSlot["shape"]> = {
  beverages: "bottle",
  drink: "bottle",
  drinks: "bottle",
  water: "bottle",
  soda: "can",
  snacks: "bag",
  chips: "bag",
  pasta: "carton",
};

const COLOR_BY_INDEX = [
  "blue",
  "green",
  "red",
  "amber",
  "orange",
  "yellow",
  "slate",
];

function getShape(category: string): PlanogramSlot["shape"] {
  const key = category.trim().toLowerCase();
  return SHAPE_BY_CATEGORY[key] ?? "bottle";
}

function shortName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length <= 12 ? trimmed : `${trimmed.slice(0, 11)}…`;
}

export function mapPlanogramPayloadToImageComparisonData(
  payload: PlanogramPayload,
): ImageComparisonData {
  const sortedShelves = sortPlanogramShelves(payload.shelves);

  const shelves = sortedShelves.map((shelf, shelfIndex) => {
    const slots = sortPlanogramProducts(shelf.products).map(
      (product, productIndex) => {
        const expectedFacings = Number.isFinite(product.facings)
          ? product.facings
          : 0;
        const depth = Number.isFinite(product.depth_count)
          ? product.depth_count
          : 1;
        const totalExpectedUnits = expectedFacings * depth;
        return {
          id: `${shelf.id}-${getPlanogramProductId(product, String(productIndex))}-${productIndex}`,
          productName: product.name,
          shortName: shortName(product.name),
          expectedFacings,
          detectedFacings: expectedFacings,
          depth,
          totalExpectedUnits,
          totalDetectedUnits: totalExpectedUnits,
          status: "matched" as const,
          shape: getShape(product.category ?? ""),
          color:
            COLOR_BY_INDEX[(productIndex + shelfIndex) % COLOR_BY_INDEX.length],
        };
      },
    );

    return {
      shelfName: getShelfDisplayLabel(sortedShelves, shelf.id),
      shelfLabel: shelf.id,
      units: slots.reduce((sum, slot) => sum + slot.totalExpectedUnits, 0),
      slots,
    };
  });

  return {
    planogramShelves: shelves,
    detectionOverlays: [],
  };
}
