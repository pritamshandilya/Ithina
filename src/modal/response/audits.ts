/**
 * API Response Types – Audits
 *
 * Shapes returned by audit and adhoc-analysis endpoints.
 */

export type AuditStatusResponse =
  | "never-audited"
  | "draft"
  | "pending"
  | "approved"
  | "returned";

export type AuditModeResponse =
  | "planogram-based"
  | "adhoc"
  | "vision-edge" // legacy
  | "assist-mode"; // legacy

export interface AuditResponse {
  id: string;
  shelfId: string;
  submittedBy: string;
  submittedAt?: string; // ISO date string
  mode: AuditModeResponse;
  status: AuditStatusResponse;
  complianceScore?: number;
  rejectionReason?: string;
  rejectedAt?: string; // ISO date string
  rejectedBy?: string;
  approvedAt?: string; // ISO date string
  approvedBy?: string;
  draftSavedAt?: string; // ISO date string
  draftProgress?: number;
  adhocAnalysisId?: string;
}

export interface AuditListResponse {
  audits: AuditResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SubmitAuditResponse {
  audit: AuditResponse;
}

export type AdhocAnalysisStatusResponse = "processing" | "completed" | "failed";

export interface AdhocAnalysisResponse {
  id: string;
  name: string;
  storeId: string;
  storeName: string;
  createdAt: string; // ISO date string
  status: AdhocAnalysisStatusResponse;
  complianceScore?: number;
  errorMessage?: string;
  shelfId?: string;
  shelfName?: string;
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}

export interface AdhocAnalysisListResponse {
  analyses: AdhocAnalysisResponse[];
  total: number;
}
