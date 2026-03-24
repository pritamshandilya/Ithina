import type { InboxItem, PayloadRow, ValidationCheck } from "@/types/approval";

/** Pending + sample approved row — aligned with index_3.1.html ApprovalView (~3905–3909). */
export const MOCK_INBOX_ITEMS: InboxItem[] = [
  {
    id: "CMP-9937-E",
    title: "Dairy & Bakery Weekend",
    initiator: "Marcus T.",
    skus: 31,
    meta: "All Pass",
    metaVariant: "success",
    urgent: false,
    status: "pending",
    hardwareTargets: ['ESL 2.9"'],
    guardRailsLabel: "All Pass",
    submittedAt: "Mar 14 · 10:05 AM",
  },
  {
    id: "CMP-9939-C",
    title: "Electronics Flash Sale",
    initiator: "Sarah J.",
    skus: 18,
    meta: "1 warning",
    metaVariant: "warning",
    urgent: false,
    status: "pending",
    hardwareTargets: ['LCD 14"'],
    guardRailsLabel: "1 warning",
    submittedAt: "Mar 13 · 15:22 PM",
  },
  {
    id: "CMP-9942-H",
    title: "Frozen Food Clearance",
    initiator: "Auto-Scheduled",
    skus: 12,
    meta: "All Pass",
    metaVariant: "success",
    urgent: false,
    status: "pending",
    hardwareTargets: ['ESL 4.2"', 'ESL 2.9"'],
    guardRailsLabel: "All Pass",
    submittedAt: "Mar 12 · 09:44 AM",
  },
  {
    id: "CMP-9941-A",
    title: "Weekend Beverage Promo",
    initiator: "Store Manager",
    skus: 42,
    meta: "All Pass",
    metaVariant: "success",
    urgent: false,
    status: "approved",
    hardwareTargets: ['ESL 4.2"', 'LCD 10"'],
    guardRailsLabel: "All Pass",
    submittedAt: "Mar 8 · 08:00 AM",
  },
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
