import { useMemo } from "react";

import type { StoreDimensionUnit } from "@/lib/constants/dimensions";

const STORE_DIMENSION_UNITS: StoreDimensionUnit[] = ["mm", "cm", "inch"];

export function useDimensionUnits() {
  const data = useMemo(() => [...STORE_DIMENSION_UNITS] as StoreDimensionUnit[], []);
  return { data };
}

