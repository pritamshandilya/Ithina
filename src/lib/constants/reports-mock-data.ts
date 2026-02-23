export interface ShelfSummary {
  id: string;
  sNo: number;
  shelf: string;
  latestAnalysis: string;
  lastUpdated: string;
  products: number | string;
  issues: number | string;
  runs: number;
  status: string;
  _children?: ShelfSummary[];
}

export interface AdhocAnalysis {
  id: string;
  sNo: number;
  name: string;
  date: string;
  products: number;
  issues: number;
  status: string;
  zone?: string;
  section?: string;
  fixtureType?: string;
  dimensions?: string;
}

export interface DetailedReport {
  id: string;
  title: string;
  date: string;
  location: string;
  complianceScore: number;
  stats: {
    mismatched: number;
    missing: number;
    missingPrice: number;
    misplaced: number;
    issues: number;
    totalProducts: number;
    onPlan: number;
    available: number;
    runs: number;
  };
  aiObservations: string;
  aisleData: { name: string; value: number }[];
  productsPerShelf: { shelf: string; count: number }[];
  spareEfficiency: { label: string; value: number }[];
  issueBreakdown: { label: string; value: number; color: string }[];
}

export const STORE_LEVEL_MOCK_DATA: ShelfSummary[] = [
  {
    id: "1",
    sNo: 1,
    shelf: "r-shelf",
    latestAnalysis: "No runs",
    lastUpdated: "—",
    products: "—",
    issues: "—",
    runs: 0,
    status: "—",
  },
];

export const SHELF_LEVEL_MOCK_DATA: ShelfSummary[] = [
  {
    id: "1",
    sNo: 1,
    shelf: "r-shelf",
    latestAnalysis: "Default Rules",
    lastUpdated: "Just now",
    products: 215,
    issues: 3,
    runs: 1,
    status: "Stale",
    _children: [
      {
        id: "1-1",
        sNo: 1,
        shelf: "Analysis Feb 20, 2026, 03:22:35 PM",
        latestAnalysis: "By Category",
        lastUpdated: "Feb 20, 2026, 03:22 PM",
        products: 215,
        issues: 3,
        runs: 1,
        status: "Stale",
      },
    ],
  },
];

export const ADHOC_REPORT_MOCK_DATA: AdhocAnalysis[] = [
  {
    id: "1",
    sNo: 1,
    name: "Adhoc Analysis Feb 17, 2026, 03:33:17 PM",
    date: "Feb 17, 2026, 03:33 PM",
    products: 101,
    issues: 5,
    status: "Failed",
    zone: "Grocery",
    section: "Beverages & Dairy",
    fixtureType: "wall_shelving",
    dimensions: "1200×2000 mm",
  },
];

export const ANALYSIS_REPORT_MOCK_DATA: DetailedReport = {
  id: "1",
  title: "Combined Compliance & Analysis Report",
  date: "Feb 17, 2026, 03:33 PM",
  location: "Downtown Flagship",
  complianceScore: 10,
  stats: {
    mismatched: 0,
    missing: 0,
    missingPrice: 0,
    misplaced: 0,
    issues: 5,
    totalProducts: 101,
    onPlan: 101,
    available: 101,
    runs: 1,
  },
  aiObservations:
    "5 items are out of stock. Total issues identified: 5 items. Minimum current stock level hit for 2 items. RECOMMENDATION: Update inventory levels and notify the manager for replenishment across the shelves.",
  aisleData: [
    { name: "Compliant", value: 10 },
    { name: "Non-Compliant", value: 90 },
  ],
  productsPerShelf: [
    { shelf: "Shelf-1", count: 18 },
    { shelf: "Shelf-2", count: 12 },
    { shelf: "Shelf-3", count: 22 },
    { shelf: "Shelf-4", count: 16 },
    { shelf: "Shelf-5", count: 14 },
    { shelf: "Shelf-6", count: 14 },
  ],
  spareEfficiency: [
    { label: "Beverage Bay", value: 85 },
    { label: "Snacks Isle", value: 92 },
    { label: "Dairy Section", value: 78 },
    { label: "Personal Care", value: 95 },
    { label: "Frozen Foods", value: 88 },
    { label: "Bakery Unit", value: 82 },
    { label: "Produce Rack", value: 90 },
    { label: "Cleaning Bay", value: 86 },
    { label: "Pet Care Isle", value: 94 },
    { label: "Breakfast Shelves", value: 89 },
    { label: "Canned Goods", value: 91 },
    { label: "Pasta & Grains", value: 84 },
    { label: "Condiment Rack", value: 87 },
    { label: "Spice Island", value: 93 },
    { label: "Soft Drinks", value: 80 },
    { label: "Water Bay", value: 96 },
  ],
  issueBreakdown: [
    { label: "EMPTY SPACE", value: 2, color: "bg-chart-2" },
    { label: "LOW MARGIN PRIME", value: 3, color: "bg-yellow-500" },
  ],
};
