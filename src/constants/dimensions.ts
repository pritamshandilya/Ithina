/** Default dimension units for store configuration (aligned with POG `STORE_DIMENSION_UNITS`). */
export const STORE_DIMENSION_UNITS = ["mm", "cm", "inch"] as const;

export type StoreDimensionUnit = (typeof STORE_DIMENSION_UNITS)[number];
