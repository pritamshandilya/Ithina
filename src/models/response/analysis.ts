export type AnalysisJobStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export type AnalysisType = "PLANOGRAM" | "ADHOC";

export interface AnalysisRow {
  count: number;
  y_top: number;
  x_left: number;
  x_right: number;
  y_bottom: number;
  y_center: number;
  row_number: number;
}

export interface AnalysisSummary {
  total: number;
  failed: number;
}

export interface AnalysisComplianceRule {
  id: string;
  name: string;
  passed: boolean;
  reason: string;
  category: string;
  severity: number;
  description: string;
}

export interface AnalysisCompliance {
  rules: AnalysisComplianceRule[];
  score: number;
  failed: number;
  passed: number;
}

export interface AnalysisBBox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface AnalysisDetectionDetails {
  row: number;
  name: string;
  brand: string;
  source: string;
  category: string;
  confidence: number;
  other_details: string;
}

export interface AnalysisDetection {
  id: number;
  bbox: AnalysisBBox;
  details: AnalysisDetectionDetails;
  on_shelf: boolean;
  confidence: number;
  row_number: number;
  shelf_index: number;
}

export interface AnalysisEmptySpace {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  width?: number;
  height?: number;
  area?: number;
  shelf_index?: number;
}

export interface PlanogramDiffIssue {
  type?: string;
  detail?: string;
  row?: number | null;
  name?: string | null;
  shelf_name?: string | null;
}

export interface PlanogramDiff {
  issues: PlanogramDiffIssue[];
  summary?: string;
  action_items: string[];
  compliance_pct?: number;
  detected_total?: number;
  expected_total?: number;
}

export interface AnalysisJobResult {
  rows: AnalysisRow[];
  count: number;
  summary: AnalysisSummary;
  compliance: AnalysisCompliance;
  detections: AnalysisDetection[];
  empty_count: number;
  empty_spaces: AnalysisEmptySpace[];
  planogram_diff?: PlanogramDiff;
  annotated_image: string | null;
}

export interface AnalysisJobResponse {
  id: string;
  store_id: string;
  fixture_id: string;
  analysis_type: AnalysisType;
  planogram_id: string | null;
  compliance_rule_set_id: string | null;
  status: AnalysisJobStatus;
  progress_message: string | null;
  progress_pct: number | null;
  result: AnalysisJobResult | null;
  error_message: string | null;
  image_path: string;
  image_name: string | null;
  image_size: number | null;
  image_mime_type: string | null;
  started_at: string | null;
  completed_at: string | null;
  mercure_topic: string;
  created_at: string;
  updated_at: string;
}
