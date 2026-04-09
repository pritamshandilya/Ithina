/**
 * Image Comparison – types for planogram layout and real shelf view.
 * Replace with API data when available.
 */

export type PlanogramSlotStatus = "matched" | "missing" | "misplaced";

/** Single product slot in the expected planogram */
export interface PlanogramSlot {
  id: string;
  productName: string;
  shortName: string;
  expectedFacings: number;
  detectedFacings: number;
  depth: number;
  totalExpectedUnits: number;
  totalDetectedUnits: number;
  status: PlanogramSlotStatus;
  severity?: "LOW" | "MEDIUM" | "HIGH";
  /** High-demand item – shown with yellow accent in planogram */
  highDemand?: boolean;
  /** Product shape hint for visualization: bottle, can, bag, carton */
  shape?: "bottle" | "can" | "bag" | "carton";
  /** Accent color for the product icon (e.g. "red", "yellow") */
  color?: string;
}

/** Shelf row in the planogram layout */
export interface PlanogramShelfRow {
  shelfName: string;
  shelfLabel: string;
  units: number;
  slots: PlanogramSlot[];
}

/** Detection overlay status for real shelf image */
export type DetectionOverlayStatus =
  | "compliant"
  | "misplaced"
  | "missing"
  | "extra";

/** Bounding box overlay on the captured shelf image (percentage-based 0–100) */
export interface DetectionOverlay {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  status: DetectionOverlayStatus;
  shelfIndex?: number;
  tooltip?: string;
}

/** Payload for Image Comparison tab */
export interface ImageComparisonData {
  planogramShelves: PlanogramShelfRow[];
  /** Overlays for the captured shelf image – from analysis API */
  detectionOverlays?: DetectionOverlay[];
}
