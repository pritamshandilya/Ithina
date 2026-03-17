export const STORE_DIMENSION_UNITS = ["cm", "mm", "m", "inch", "ft"] as const;

export type StoreDimensionUnit = (typeof STORE_DIMENSION_UNITS)[number];

