import type { InboxItem, PayloadRow, ValidationCheck } from "@/types/approval";

export const MOCK_INBOX_ITEMS: InboxItem[] = [
  { id: "inbox-1", title: "Sushi Clearance", subtitle: "(Urgent)", initiator: "Sarah J.", skus: 4, meta: "Est: +$124/day", metaVariant: "success", urgent: true },
  { id: "inbox-2", title: "Weekend Beverage Promo", initiator: "Auto-Scheduled", skus: 42, meta: "Scheduled: Friday", metaVariant: "muted", urgent: false },
  { id: "inbox-3", title: "Electronics Flash Sale", initiator: "Sarah J.", skus: 18, meta: "Drafted: 2h ago", metaVariant: "muted", urgent: false },
];

export const MOCK_VALIDATION_CHECKS: ValidationCheck[] = [
  { label: "Hardware Constraints", value: "1-Bit RGB Verified", passed: true },
  { label: "Accessibility (WCAG)", value: "Contrast Passed", passed: true },
  { label: "Asset Verification", value: "Verified (Mfg API)", passed: true },
  { label: "Margin Exception", value: "1 SKU < 15%", passed: false, isException: true },
];

export const MOCK_PAYLOAD_ROWS: PayloadRow[] = [
  { sku: "SUSHI-099C", name: "Dragon Roll Combo", oldPrice: 16.99, newPrice: 13.59, marginStatus: "alert", marginValue: "14%" },
  { sku: "SUSHI-019A", name: "Premium Salmon Tray", oldPrice: 12.99, newPrice: 10.39, marginStatus: "pass" },
];
