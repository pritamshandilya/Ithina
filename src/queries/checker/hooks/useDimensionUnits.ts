import { useMemo } from "react";

import { STORE_DIMENSION_UNITS, type StoreDimensionUnit } from "@/lib/constants/dimensions";

export function useDimensionUnits() {
  const data = useMemo(() => [...STORE_DIMENSION_UNITS] as StoreDimensionUnit[], []);
  return { data };
}

