export type AnalysisJobStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export type AnalysisType = "PLANOGRAM" | "ADHOC";

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
  result: Record<string, unknown> | null;
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
