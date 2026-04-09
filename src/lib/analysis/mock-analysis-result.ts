/**
 * Mock analysis result – placeholder until real JSON snippets are provided.
 */

import type { AnalysisResult } from "./analysis-result-types";

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  complianceScore: 87,
  totalIssues: 3,
  missingSkus: 1,
  misplacedSkus: 1,
  emptySpaces: 1,
  issues: [
    { skuName: "Beige Pasta Bag", description: "Missing 2 facings", type: "Missing" },
    { skuName: "Shelf 2", description: "Empty space detected", type: "Empty Space" },
    { skuName: "Black Pasta Box", description: "Misaligned position", type: "Misplaced" },
  ],
};
