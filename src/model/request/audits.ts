/**
 * API Payload Types – Audits
 *
 * Request bodies sent to audit-related endpoints.
 */

export interface SubmitAuditPayload {
  shelfId: string;
  mode: "planogram-based" | "adhoc" | "vision-edge" | "assist-mode";
  complianceScore: number;
  imageUrl?: string;
  planogramId?: string;
}

export interface SaveDraftAuditPayload {
  progress: number; // 0–100
}

export interface ResubmitAuditPayload {
  /** Optional note from maker on resubmission */
  note?: string;
}

export interface StartAdhocAnalysisPayload {
  /** Form-data file key – image is uploaded as multipart */
  imageFile?: File;
  storeId: string;
  name: string;
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}
