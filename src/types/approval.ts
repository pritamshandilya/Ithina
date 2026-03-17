export interface InboxItem {
  id: string;
  title: string;
  subtitle?: string;
  initiator: string;
  skus: number;
  meta: string;
  metaVariant: "success" | "muted";
  urgent: boolean;
  status?: "pending" | "rejected";
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
