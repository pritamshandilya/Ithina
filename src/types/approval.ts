export interface InboxItem {
  id: string;
  title: string;
  subtitle?: string;
  initiator: string;
  skus: number;
  meta: string;
  metaVariant: "success" | "muted" | "warning";
  urgent: boolean;
  status?: "pending" | "approved" | "rejected";

  // Prototype-only fields (used for the approval queue table layout).
  hardwareTargets?: string[];
  guardRailsLabel?: string;
  submittedAt?: string;
}

export interface ValidationCheck {
  label: string;
  value: string;
  passed: boolean;
  isException?: boolean;
}

export type DiffTrack = "esl" | "lcd";

export interface PayloadRow {
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  marginStatus: "pass" | "alert";
  marginValue?: string;
}
