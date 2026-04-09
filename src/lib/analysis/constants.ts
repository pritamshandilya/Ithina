/**
 * Shared pipeline step definitions for audit analysis (adhoc and planogram-based)
 */

import type { LucideIcon } from "lucide-react";
import { Box, Rows3, Database, PenLine, GitBranch, FileText } from "lucide-react";

export interface PipelineStepDef {
  id: "detection" | "rows" | "recogn" | "input" | "mapping" | "report";
  label: string;
  sub: string;
  icon: LucideIcon;
}

export const PIPELINE_STEPS: PipelineStepDef[] = [
  { id: "detection", label: "Product Detection", sub: "YOLOv8 + SAHI identify items", icon: Box },
  { id: "rows", label: "Shelf Rows", sub: "Deep Hough detects row boundaries", icon: Rows3 },
  { id: "recogn", label: "Recognition", sub: "CLIP embeddings match products", icon: Database },
  { id: "input", label: "Data Enrichment", sub: "User input refines matches", icon: PenLine },
  { id: "mapping", label: "Geometric Mapping", sub: "Logic maps layout & positions", icon: GitBranch },
  { id: "report", label: "Compliance Report", sub: "Planogram engine generates results", icon: FileText },
];

/** Simple progress labels for Maker UI – no technical terminology */
export const SIMPLE_PROGRESS_STEPS = [
  "Detecting products",
  "Mapping layout",
  "Checking compliance",
] as const;
