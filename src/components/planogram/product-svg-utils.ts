/**
 * Utility to map category to SVG component – separate from product-svgs.tsx
 * to avoid Fast Refresh issues (mixing component and non-component exports)
 */

import type { ComponentType } from "react";

import type { ProductSVGProps } from "./product-svgs";
import {
  AperitifBagSVG,
  BabyCareSVG,
  BottleSVG,
  CanSVG,
  CartonSVG,
  CerealBoxSVG,
  ChipBagSVG,
  ChipsBagSVG,
  CoffeeBagSVG,
  EnergyDrinkCanSVG,
  FirstAidSVG,
  RazorPackSVG,
} from "./product-svgs";

const CATEGORY_TO_SVG: Record<string, ComponentType<ProductSVGProps>> = {
  "Aperitif Snacks": AperitifBagSVG,
  Chips: ChipsBagSVG,
  Snacks: ChipBagSVG,
  "Kids Cereal": CerealBoxSVG,
  Coffee: CoffeeBagSVG,
  "Baby Care": BabyCareSVG,
  "First Aid": FirstAidSVG,
  Grooming: RazorPackSVG,
  Water: BottleSVG,
  "Sparkling Water": BottleSVG,
  "Soft Drinks": CanSVG,
  Juices: BottleSVG,
  Nectars: BottleSVG,
  Dairy: CartonSVG,
  Milk: CartonSVG,
  "Energy Drinks": EnergyDrinkCanSVG,
};

/** Returns the SVG component for a category; fallback to ChipBagSVG */
export function getProductSVG(category: string): ComponentType<ProductSVGProps> {
  return CATEGORY_TO_SVG[category] ?? ChipBagSVG;
}
