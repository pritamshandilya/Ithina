export type GuardRailCategory = "Pricing" | "Brand" | "Regulatory" | "Content";
export type GuardRailSeverity = "Hard" | "Soft";

export interface GuardRailRule {
  id: string;
  name: string;
  category: GuardRailCategory;
  severity: GuardRailSeverity;
  description: string;
  active: boolean;
  /** From API; used to interpret margin floor checks in campaign detail. */
  thresholdValue?: number | null;
}

export const MOCK_GUARD_RAIL_RULES: GuardRailRule[] = [
  {
    id: "gr1",
    name: "Margin Floor",
    category: "Pricing",
    severity: "Hard",
    description: "No SKU may be promoted below 15% margin.",
    active: true,
  },
  {
    id: "gr2",
    name: "Max Discount Cap",
    category: "Pricing",
    severity: "Hard",
    description: "Discount cannot exceed 35% off regular price.",
    active: true,
  },
  {
    id: "gr3",
    name: "Brand Colour Palette",
    category: "Brand",
    severity: "Soft",
    description: "Header must use approved brand colour swatches.",
    active: true,
  },
  {
    id: "gr4",
    name: "Minimum Font Size",
    category: "Brand",
    severity: "Soft",
    description: "No text element below 12pt on ESL, 18pt on LCD.",
    active: true,
  },
  {
    id: "gr5",
    name: "Allergen Labelling",
    category: "Regulatory",
    severity: "Hard",
    description: "All food items must display allergen information.",
    active: true,
  },
  {
    id: "gr6",
    name: "Unit Pricing Display",
    category: "Regulatory",
    severity: "Hard",
    description: "Unit price per 100g/100ml must be visible.",
    active: true,
  },
  {
    id: "gr7",
    name: "No Lifestyle Imagery",
    category: "Content",
    severity: "Soft",
    description: "Imagery should show product only, no lifestyle.",
    active: false,
  },
  {
    id: "gr8",
    name: "Competitor Pricing",
    category: "Pricing",
    severity: "Soft",
    description: "Price must be within 5% of nearest competitor.",
    active: false,
  },
];
