import type { StoreDimensionUnit } from "@/lib/constants/dimensions";
import type {
  FixtureConfig,
  ShelfTemplateConfig,
} from "@/components/admin/stores/store-onboarding-config-step";

export const DEFAULT_ONBOARDING_FIXTURES: FixtureConfig[] = [
  {
    type: "Gondola (standard)",
    width: "120",
    height: "200",
    depth: "45",
    dimension_unit: "cm",
    section: "General",
    aisle: "A1",
    zone: "General",
  },
  {
    type: "Endcap",
    width: "100",
    height: "190",
    depth: "40",
    dimension_unit: "cm",
    section: "Promotions",
    aisle: "A1",
    zone: "Front",
  },
  {
    type: "Cooler/Chiller",
    width: "120",
    height: "200",
    depth: "60",
    dimension_unit: "cm",
    section: "Cold",
    aisle: "A2",
    zone: "Dairy",
  },
  {
    type: "Checkout Lane",
    width: "90",
    height: "140",
    depth: "35",
    dimension_unit: "cm",
    section: "Checkout",
    aisle: "C1",
    zone: "Front",
  },
  {
    type: "Wall Unit",
    width: "120",
    height: "220",
    depth: "40",
    dimension_unit: "cm",
    section: "Perimeter",
    aisle: "W1",
    zone: "General",
  },
];

export const DEFAULT_ONBOARDING_SHELF_TEMPLATES: ShelfTemplateConfig[] = [
  {
    name: '4-shelf standard (48"W)',
    description: "4 shelves · gondola bay",
    fixtureType: "gondola",
    zone: "Grocery",
    section: "General",
    width: "48",
    height: "72",
    depth: "18",
  },
  {
    name: '5-shelf tall (48"W)',
    description: "5 shelves · tall gondola",
    fixtureType: "gondola",
    zone: "Grocery",
    section: "General",
    width: "48",
    height: "84",
    depth: "18",
  },
  {
    name: "3-shelf cooler",
    description: "3 shelves · refrigerated bay",
    fixtureType: "cooler",
    zone: "Dairy",
    section: "Cold",
    width: "48",
    height: "78",
    depth: "30",
  },
];

export const emptyShelfTemplateForm = (): ShelfTemplateConfig => ({
  name: "",
  description: "",
  fixtureType: "gondola",
  zone: "",
  section: "",
  width: "",
  height: "",
  depth: "",
});

export const defaultConfigForm = (): { default_dimensions: StoreDimensionUnit } => ({
  default_dimensions: "inch",
});
