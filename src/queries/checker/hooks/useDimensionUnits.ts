import { useQuery } from "@tanstack/react-query";

import { fetchDimensionUnits } from "@/queries/shared/dimensions";

export const dimensionKeys = {
  all: ["dimensions"] as const,
  units: () => [...dimensionKeys.all, "units"] as const,
};

export function useDimensionUnits() {
  return useQuery({
    queryKey: dimensionKeys.units(),
    queryFn: fetchDimensionUnits,
  });
}

