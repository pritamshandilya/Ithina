/**
 * Mock report snippet data – mirrors full report structure.
 * Replace with real API data when available.
 */

import type { ReportSnippet } from "./report-snippet-types";

export const MOCK_REPORT_SNIPPET: ReportSnippet = {
  planogramName: "Food & Beverage Shelf",
  productsDetected: 87,
  analysisIssues: 5,

  complianceScore: 25,
  matched: 6,
  misplaced: 2,
  missing: 8,
  extra: 79,
  issues: 5,
  facings: 41,
  units: 123,
  detected: 87,
  gap: 99,

  executiveSummary:
    "This report compares the actual shelf arrangement (captured image) against the planogram 'Food & Beverage Shelf'. The system detected 87 products on the shelf and compared them to 41 expected front facings (11 SKUs) across 4 shelves.",

  keyFindings: [
    {
      type: "error",
      text: "Low compliance. Only 25% front-facing match. Immediate attention required.",
    },
    {
      type: "error",
      text: "8 missing front facings. 99 total units short (including depth stock).",
    },
    {
      type: "info",
      text: "Depth verification needed. 3 products require manual depth stock verification behind front facings.",
    },
    {
      type: "warning",
      text: "5 analysis issues. Safety, efficiency, or assortment violations.",
    },
  ],

  aiRecommendations: [
    "1 empty space(s) detected. Recommendation: Fill spaces to maximize shelf utilization.",
    "PROFITABILITY: High contribution items (Yellow Pasta Box, Black Pasta Box) are outside the eye-level zone. Relocate to Row 4.",
    "EFFICIENCY: Black Pasta Bag have low Contribution per Sq. Ft. Consider reducing facings to free up space.",
  ],

  shelfCompliance: [
    { shelfName: "Shelf 1", shelfLabel: "Top Shelf - Snacks", compliance: 100, units: 18, skuCount: 2 },
    { shelfName: "Shelf 2", shelfLabel: "Second Shelf - Beverages & Snacks", compliance: 0, units: 45, skuCount: 3 },
    { shelfName: "Shelf 3", shelfLabel: "Third Shelf - Juices & Drinks", compliance: 0, units: 33, skuCount: 3 },
    { shelfName: "Shelf 4", shelfLabel: "Bottom Shelf - Pasta", compliance: 0, units: 27, skuCount: 3 },
  ],

  issueDistribution: {
    matched: 6,
    misplaced: 2,
    missing: 8,
    extra: 79,
  },

  issueCategories: [
    {
      id: "shelf-placement",
      title: "Shelf Placement Issues",
      count: 2,
      description: "Products placed on the wrong shelf or in the wrong position.",
      variant: "misplaced",
    },
    {
      id: "missing",
      title: "Missing Products",
      count: 8,
      description: "Products defined in the planogram but not detected on the shelf.",
      variant: "missing",
    },
    {
      id: "extra",
      title: "Extra / Unauthorized Products",
      count: 79,
      description: "Products detected on the shelf that are not part of the planogram.",
      variant: "extra",
    },
    {
      id: "depth",
      title: "Depth Stock Verification",
      count: 3,
      description: "Products where front facings match but depth stock needs manual verification.",
      variant: "depth",
    },
    {
      id: "analysis",
      title: "Space & Efficiency",
      count: 5,
      description: "Empty shelf spaces, out of stock gaps, or low-margin product placement.",
      variant: "analysis",
    },
  ],

  issuesToReview: [
    { skuName: "Coca-Cola 500ml", description: "0/6 facings detected — missing", type: "Missing" },
    { skuName: "Water Bottle 1L", description: "0/3 facings detected — missing", type: "Missing" },
    { skuName: "Yellow Pasta Box", description: "Misplaced — expected shelf 4, found on shelf 1", type: "Misplaced" },
    { skuName: "Shelf 2", description: "Empty space detected", type: "Empty Space" },
    { skuName: "Black Pasta Box", description: "Low margin in prime position", type: "Analysis" },
  ],
};
