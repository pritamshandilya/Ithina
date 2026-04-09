/**
 * API Payload Types – Checker Actions
 *
 * Request bodies for checker governance actions on audits.
 */

export interface ApproveAuditPayload {
  /** Optional checker note on approval */
  note?: string;
}

export interface ReturnAuditPayload {
  reason: string;
}

export interface OverrideAndApprovePayload {
  overrideReason: string;
}

export interface MarkNotificationsReadPayload {
  notificationIds: string[];
}
