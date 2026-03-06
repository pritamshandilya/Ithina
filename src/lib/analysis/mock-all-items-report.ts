/**
 * Mock data for All Items report tab.
 * Replace with API call when backend is ready.
 */

import type { AllItemsReportData } from "./all-items-report-types";

export const MOCK_ALL_ITEMS_REPORT: AllItemsReportData = {
  planogramItems: [
    { id: "pi-1", productName: "Potato Chips", sku: "SNACK-001", shelf: "Shelf 1", status: "matched", complianceLevel: "LOW", issueDescription: undefined },
    { id: "pi-2", productName: "Tortilla Chips", sku: "SNACK-002", shelf: "Shelf 1", status: "matched", complianceLevel: "LOW", issueDescription: undefined },
    { id: "pi-3", productName: "Pretzels", sku: "SNACK-003", shelf: "Shelf 4", status: "misplaced", complianceLevel: "MEDIUM", issueDescription: "Wrong shelf: expected shelf 4, found on shelf 1" },
    { id: "pi-4", productName: "Coca-Cola 500ml", sku: "BEV-001", shelf: "Shelf 2", status: "missing", complianceLevel: "HIGH", issueDescription: "'Coca-Cola 500ml' (BEV-001): expected 6 front facings x 3 deep = 18 total, none detected on shelf 2 (18 units missing)" },
    { id: "pi-5", productName: "Water Bottle 1L", sku: "BEV-002", shelf: "Shelf 2", status: "missing", complianceLevel: "HIGH", issueDescription: "'Water Bottle 1L' (BEV-002): expected 3 front facings x 3 deep = 9 total, none detected on shelf 2 (9 units missing)" },
    { id: "pi-6", productName: "Energy Drink", sku: "BEV-003", shelf: "Shelf 2", status: "missing", complianceLevel: "HIGH", issueDescription: "Expected 6 front facings x 3 deep = 18 total, none detected on shelf 2" },
    { id: "pi-7", productName: "Soft Drink 2L", sku: "BEV-008", shelf: "Shelf 4", status: "missing", complianceLevel: "HIGH", issueDescription: "'Soft Drink 2L' (BEV-008): expected 3 front facings x 3 deep = 9 total, none detected on shelf 4 (9 units missing)" },
    { id: "pi-8", productName: "Yellow Pasta Bag", sku: "PASTA-01", shelf: "Shelf 1", status: "extra", complianceLevel: "MEDIUM", issueDescription: "Unexpected product \"Yellow Pasta Bag\" detected on shelf 1" },
    { id: "pi-9", productName: "White Pasta Box", sku: "PASTA-02", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: "Unexpected product detected on shelf 4" },
    { id: "pi-10", productName: "Black Pasta Box", sku: "PASTA-03", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: undefined },
    { id: "pi-11", productName: "Red Pasta Bag", sku: "PASTA-04", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: undefined },
    { id: "pi-12", productName: "Blue Pasta Box", sku: "PASTA-05", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: undefined },
    { id: "pi-13", productName: "Green Pasta Stack", sku: "PASTA-06", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: undefined },
    { id: "pi-14", productName: "Red Pasta Stack", sku: "PASTA-07", shelf: "Shelf 4", status: "extra", complianceLevel: "MEDIUM", issueDescription: undefined },
    { id: "pi-15", productName: "Orange Juice 1L", sku: "BEV-004", shelf: "Shelf 3", status: "missing", complianceLevel: "HIGH", issueDescription: "Expected 4 front facings x 3 deep = 12 total, none detected" },
    { id: "pi-16", productName: "Sports Drink", sku: "BEV-005", shelf: "Shelf 3", status: "missing", complianceLevel: "HIGH", issueDescription: "Expected 4 front facings x 3 deep = 12 total, none detected" },
    { id: "pi-17", productName: "Iced Tea 500ml", sku: "BEV-006", shelf: "Shelf 3", status: "missing", complianceLevel: "HIGH", issueDescription: "Expected 3 front facings x 3 deep = 9 total, none detected" },
    { id: "pi-18", productName: "Mineral Water 1L", sku: "BEV-007", shelf: "Shelf 4", status: "missing", complianceLevel: "HIGH", issueDescription: "Expected 3 front facings x 3 deep = 9 total, none detected" },
  ],

  skuFacings: [
    { id: "sf-1", productName: "Coca-Cola 500ml", sku: "BEV-001", frontFacings: 6, detected: 0, depth: 3, totalExpected: 18, facingDiffText: "-6 short (18 units)", facingDiffVariant: "short" },
    { id: "sf-2", productName: "Water Bottle 1L", sku: "BEV-002", frontFacings: 3, detected: 0, depth: 3, totalExpected: 9, facingDiffText: "-3 short (9 units)", facingDiffVariant: "short" },
    { id: "sf-3", productName: "Potato Chips", sku: "SNACK-001", frontFacings: 4, detected: 4, depth: 3, totalExpected: 12, facingDiffText: "OK", facingDiffVariant: "ok" },
    { id: "sf-4", productName: "Tortilla Chips", sku: "SNACK-002", frontFacings: 2, detected: 2, depth: 3, totalExpected: 6, facingDiffText: "OK", facingDiffVariant: "ok" },
    { id: "sf-5", productName: "Energy Drink", sku: "BEV-003", frontFacings: 6, detected: 0, depth: 3, totalExpected: 18, facingDiffText: "-6 short (18 units)", facingDiffVariant: "short" },
    { id: "sf-6", productName: "Orange Juice 1L", sku: "BEV-004", frontFacings: 4, detected: 0, depth: 3, totalExpected: 12, facingDiffText: "-4 short (12 units)", facingDiffVariant: "short" },
    { id: "sf-7", productName: "Sports Drink", sku: "BEV-005", frontFacings: 4, detected: 0, depth: 3, totalExpected: 12, facingDiffText: "-4 short (12 units)", facingDiffVariant: "short" },
    { id: "sf-8", productName: "Iced Tea 500ml", sku: "BEV-006", frontFacings: 3, detected: 0, depth: 3, totalExpected: 9, facingDiffText: "-3 short (9 units)", facingDiffVariant: "short" },
    { id: "sf-9", productName: "Soft Drink 2L", sku: "BEV-008", frontFacings: 3, detected: 0, depth: 3, totalExpected: 9, facingDiffText: "-3 short (9 units)", facingDiffVariant: "short" },
    { id: "sf-10", productName: "Yellow Pasta Bag", sku: "PASTA-01", frontFacings: 0, detected: 13, depth: 3, totalExpected: 0, facingDiffText: "+13 extra", facingDiffVariant: "extra" },
    { id: "sf-11", productName: "White Pasta Box", sku: "PASTA-02", frontFacings: 0, detected: 3, depth: 3, totalExpected: 0, facingDiffText: "+3 extra", facingDiffVariant: "extra" },
    { id: "sf-12", productName: "Black Pasta Box", sku: "PASTA-03", frontFacings: 0, detected: 6, depth: 3, totalExpected: 0, facingDiffText: "+6 extra", facingDiffVariant: "extra" },
    { id: "sf-13", productName: "Red Pasta Bag", sku: "PASTA-04", frontFacings: 0, detected: 14, depth: 3, totalExpected: 0, facingDiffText: "+14 extra", facingDiffVariant: "extra" },
    { id: "sf-14", productName: "Blue Pasta Box", sku: "PASTA-05", frontFacings: 0, detected: 7, depth: 3, totalExpected: 0, facingDiffText: "+7 extra", facingDiffVariant: "extra" },
    { id: "sf-15", productName: "Green Pasta Stack", sku: "PASTA-06", frontFacings: 0, detected: 9, depth: 3, totalExpected: 0, facingDiffText: "+9 extra", facingDiffVariant: "extra" },
    { id: "sf-16", productName: "Red Pasta Stack", sku: "PASTA-07", frontFacings: 0, detected: 4, depth: 3, totalExpected: 0, facingDiffText: "+4 extra", facingDiffVariant: "extra" },
    { id: "sf-17", productName: "Black Pasta Bag", sku: "PASTA-08", frontFacings: 0, detected: 7, depth: 3, totalExpected: 0, facingDiffText: "+7 extra", facingDiffVariant: "extra" },
    { id: "sf-18", productName: "Pretzels", sku: "SNACK-003", frontFacings: 2, detected: 2, depth: 3, totalExpected: 6, facingDiffText: "OK", facingDiffVariant: "ok" },
  ],
};
