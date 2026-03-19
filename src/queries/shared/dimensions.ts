const DIMENSION_UNITS: string[] = ["mm", "cm", "inch"];

export async function fetchDimensionUnits(): Promise<string[]> {
  // Frontend-only constant for now; backend endpoint is not yet wired.
  return DIMENSION_UNITS;
}

