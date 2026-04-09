/**
 * Mock data for All Issues report tab.
 * Replace with API call when backend is ready.
 */

import type { AllIssuesReportData } from "./all-issues-report-types";

export const MOCK_ALL_ISSUES_REPORT: AllIssuesReportData = {
  categories: [
    {
      id: "shelf-placement",
      title: "Shelf Placement Issues",
      count: 2,
      description:
        "Products placed on the wrong shelf or in the wrong position relative to the planogram.",
      variant: "misplaced",
      issues: [
        {
          id: "sp-1",
          productName: "Pretzels",
          sku: "SNACK-001",
          description: "Wrong shelf: expected shelf 4, found on shelf 1",
          detail: "Expected Shelf 4 → Actual Shelf 1",
          severity: "MEDIUM",
        },
        {
          id: "sp-2",
          productName: "Pretzels",
          sku: "SNACK-003",
          description: "Wrong shelf: expected shelf 4, found on shelf 1",
          detail: "Expected Shelf 4 → Actual Shelf 1",
          severity: "MEDIUM",
        },
      ],
    },
    {
      id: "missing",
      title: "Missing Products",
      count: 8,
      description:
        "Products defined in the planogram but not detected on the real shelf. May indicate out of stock or restocking issues.",
      variant: "missing",
      issues: [
        {
          id: "mp-1",
          productName: "Coca-Cola 500ml",
          sku: "BEV-001",
          description:
            '"Coca-Cola 500ml" (BEV-001): expected 6 front facings x 3 deep = 18 total, none detected on shelf 2 (18 units missing)',
          metrics: "Shelf 2 Front: 0/6 Depth: 3 Missing Units: 18",
          severity: "HIGH",
        },
        {
          id: "mp-2",
          productName: "Water Bottle 1L",
          sku: "BEV-002",
          description:
            '"Water Bottle 1L" (BEV-002): expected 3 front facings x 3 deep = 9 total, none detected on shelf 2 (9 units missing)',
          metrics: "Shelf 2 Front: 0/3 Depth: 3 Missing Units: 9",
          severity: "HIGH",
        },
        {
          id: "mp-3",
          productName: "Energy Drink",
          sku: "BEV-003",
          description:
            '"Energy Drink" (BEV-003): expected 6 front facings x 3 deep = 18 total, none detected on shelf 2 (18 units missing)',
          metrics: "Shelf 2 Front: 0/6 Depth: 3 Missing Units: 18",
          severity: "HIGH",
        },
        {
          id: "mp-4",
          productName: "Orange Juice 1L",
          sku: "BEV-004",
          description:
            '"Orange Juice 1L" (BEV-004): expected 4 front facings x 3 deep = 12 total, none detected on shelf 3',
          metrics: "Shelf 3 Front: 0/4 Depth: 3 Missing Units: 12",
          severity: "HIGH",
        },
        {
          id: "mp-5",
          productName: "Sports Drink",
          sku: "BEV-005",
          description:
            '"Sports Drink" (BEV-005): expected 4 front facings x 3 deep = 12 total, none detected on shelf 3',
          metrics: "Shelf 3 Front: 0/4 Depth: 3 Missing Units: 12",
          severity: "HIGH",
        },
        {
          id: "mp-6",
          productName: "Iced Tea 500ml",
          sku: "BEV-006",
          description:
            '"Iced Tea 500ml" (BEV-006): expected 3 front facings x 3 deep = 9 total, none detected on shelf 3',
          metrics: "Shelf 3 Front: 0/3 Depth: 3 Missing Units: 9",
          severity: "HIGH",
        },
        {
          id: "mp-7",
          productName: "Mineral Water 1L",
          sku: "BEV-007",
          description:
            '"Mineral Water 1L" (BEV-007): expected 3 front facings x 3 deep = 9 total, none detected on shelf 4',
          metrics: "Shelf 4 Front: 0/3 Depth: 3 Missing Units: 9",
          severity: "HIGH",
        },
        {
          id: "mp-8",
          productName: "Soft Drink 2L",
          sku: "BEV-008",
          description:
            '"Soft Drink 2L" (BEV-008): expected 3 front facings x 3 deep = 9 total, none detected on shelf 4 (9 units missing)',
          metrics: "Shelf 4 Front: 0/3 Depth: 3 Missing Units: 9",
          severity: "HIGH",
        },
      ],
    },
    {
      id: "extra",
      title: "Extra / Unauthorized Products",
      count: 80,
      description:
        "Products detected on the shelf that are not part of the planogram. These may need to be removed or added to the planogram.",
      variant: "extra",
      issues: [
        {
          id: "ex-1",
          productName: "Yellow Pasta Bag",
          description: 'Unexpected product "Yellow Pasta Bag" detected on shelf 1',
          severity: "MEDIUM",
        },
        {
          id: "ex-2",
          productName: "Yellow Pasta Bag",
          description: 'Unexpected product "Yellow Pasta Bag" detected on shelf 1',
          severity: "MEDIUM",
        },
        {
          id: "ex-3",
          productName: "Yellow Pasta Bag",
          description: 'Unexpected product "Yellow Pasta Bag" detected on shelf 1',
          severity: "MEDIUM",
        },
        {
          id: "ex-4",
          productName: "White Pasta Box",
          description: 'Unexpected product "White Pasta Box" detected on shelf 4',
          severity: "MEDIUM",
        },
        {
          id: "ex-5",
          productName: "Black Pasta Box",
          description: 'Unexpected product "Black Pasta Box" detected on shelf 4',
          severity: "MEDIUM",
        },
        {
          id: "ex-6",
          productName: "Red Pasta Bag",
          description: 'Unexpected product "Red Pasta Bag" detected on shelf 4',
          severity: "MEDIUM",
        },
        {
          id: "ex-7",
          productName: "Blue Pasta Box",
          description: 'Unexpected product "Blue Pasta Box" detected on shelf 4',
          severity: "MEDIUM",
        },
        {
          id: "ex-8",
          productName: "Green Pasta Stack",
          description: 'Unexpected product "Green Pasta Stack" detected on shelf 4',
          severity: "MEDIUM",
        },
      ],
    },
    {
      id: "depth",
      title: "Depth Stock Verification",
      count: 3,
      description:
        "Products where front facings match but depth stock behind each facing needs manual verification.",
      variant: "depth",
      issues: [
        {
          id: "dv-1",
          productName: "Potato Chips",
          sku: "SNACK-001",
          description:
            '"Potato Chips" (SNACK-001): 4 front facings verified, depth 3 = 12 total units expected. Verify 2 units behind each facing.',
          metrics: "Front: 4/4 Depth: 3 Total Expected: 12",
          severity: "LOW",
        },
        {
          id: "dv-2",
          productName: "Tortilla Chips",
          sku: "SNACK-002",
          description:
            '"Tortilla Chips" (SNACK-002): 2 front facings verified, depth 3 = 6 total units expected. Verify 2 units behind each facing.',
          metrics: "Front: 2/2 Depth: 3 Total Expected: 6",
          severity: "LOW",
        },
        {
          id: "dv-3",
          productName: "Pretzels",
          sku: "SNACK-003",
          description:
            '"Pretzels" (SNACK-003): 2 front facings verified, depth 3 = 6 total units expected. Verify 2 units behind each facing.',
          metrics: "Front: 2/2 Depth: 3 Total Expected: 6",
          severity: "LOW",
        },
      ],
    },
    {
      id: "analysis",
      title: "Space & Efficiency",
      count: 3,
      description:
        "Empty shelf spaces, out-of-stock gaps, or low-margin products occupying prime shelf positions.",
      variant: "analysis",
      issues: [
        {
          id: "ae-1",
          productName: "Yellow Pasta Box",
          description: "Yellow Pasta Box should be at eye level",
          why: "High margin items generate more revenue when placed at eye level",
          severity: "MEDIUM",
        },
        {
          id: "ae-2",
          productName: "White Pasta Box",
          description: "White Pasta Box should be at eye level",
          why: "High margin items generate more revenue when placed at eye level",
          severity: "MEDIUM",
        },
        {
          id: "ae-3",
          productName: "Black Pasta Box",
          description: "Black Pasta Box should be at eye level",
          why: "High margin items generate more revenue when placed at eye level",
          severity: "MEDIUM",
        },
      ],
    },
  ],
};
