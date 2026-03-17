export const STORE_DIMENSION_UNITS = ["mm", "cm", "inch"] as const;

export type StoreDimensionUnit = (typeof STORE_DIMENSION_UNITS)[number];

