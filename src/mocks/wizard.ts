import type {
  HardwareDevice,
  StagedSku,
  WizardDuration,
  WizardMargin,
  WizardStore,
} from "@/types/wizard";

export const MOCK_STORES: WizardStore[] = [
  {
    id: "4281",
    name: "Chicago North",
    short: "#4281",
    address: "847 N Michigan Ave, Chicago, IL",
    displays: 14,
    activePromos: 3,
  },
  {
    id: "region1",
    name: "All Region 1 Stores",
    short: "Region 1",
    address: "12 stores · IL, WI, IN",
    displays: 168,
    activePromos: 11,
  },
  {
    id: "south-loop",
    name: "Chicago South Loop",
    short: "South Loop",
    address: "233 S Wacker Dr, Chicago, IL",
    displays: 9,
    activePromos: 1,
  },
  {
    id: "evanston-main",
    name: "Evanston Main",
    short: "Evanston",
    address: "1501 Sherman Ave, Evanston, IL",
    displays: 11,
    activePromos: 2,
  },
];

export const MOCK_MARGINS: WizardMargin[] = [
  {
    value: "15%",
    risk: "Safe",
    desc: "Standard floor — covers most categories",
    impact: "~2 SKUs typically flagged",
  },
  {
    value: "20%",
    risk: "Moderate",
    desc: "Tighter guardrail for premium categories",
    impact: "~5 SKUs typically flagged",
  },
  {
    value: "25%",
    risk: "Strict",
    desc: "Maximum protection, limits deep discounts",
    impact: "~9 SKUs typically flagged",
  },
];

export const MOCK_DURATIONS: WizardDuration[] = [
  { id: "weekend", label: "This Weekend", short: "2d", desc: "Ends Sunday 11:59 PM" },
  { id: "7days", label: "7 Days", short: "7d", desc: "Rolling 7-day window" },
  { id: "14days", label: "14 Days", short: "14d", desc: "Two-week campaign" },
  { id: "eom", label: "End of Month", short: "EOM", desc: "Runs through month-end" },
];

export const MOCK_STAGED_SKUS: StagedSku[] = [
  { sku: "SUSHI-019A", name: "Premium Salmon Tray", current: 12.99, proposed: 10.39, safe: true },
  { sku: "SUSHI-048B", name: "Spicy Tuna Roll 12pc", current: 14.49, proposed: 11.59, safe: true },
  { sku: "SUSHI-099C", name: "Dragon Roll Combo", current: 16.99, proposed: 13.59, safe: false, margin: "14%" },
];

export const MOCK_HARDWARE_DEVICES: HardwareDevice[] = [
  { id: "chroma29", name: "Chroma 29", resolution: "296x128", track: "Track 1 · 3-Color", aspectRatio: "296/128" },
  { id: "chroma42", name: "Chroma 42", resolution: "400x300", track: "Track 1 · 3-Color", aspectRatio: "400/300" },
  { id: "lcd", name: "LCD Banner", resolution: "1920x1080", track: "Track 2 · Full Color", aspectRatio: "16/9" },
];
