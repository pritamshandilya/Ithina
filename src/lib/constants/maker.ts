import type { AuditStatus } from "@/types/maker";

/** Display labels for audit/shelf status */
export const AUDIT_STATUS_LABELS: Record<AuditStatus, string> = {
  "never-audited": "Never Audited",
  draft: "Draft",
  pending: "Pending Review",
  approved: "Approved",
  returned: "Returned",
};

/** CSS class for status badge in DataTable formatters */
export function getAuditStatusClass(status: AuditStatus): string {
  switch (status) {
    case "approved":
      return "status-approved";
    case "pending":
      return "status-pending";
    case "returned":
      return "status-returned";
    case "draft":
      return "status-draft";
    default:
      return "status-never-audited";
  }
}
