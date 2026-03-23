import { useQuery } from "@tanstack/react-query";

import { readStoreFixtureTypeLabels } from "@/lib/store-defaults-storage";
import { useStore } from "@/providers/store";

export const storeDefaultsKeys = {
  all: ["store-defaults"] as const,
  fixtureTypes: (storeId: string) =>
    [...storeDefaultsKeys.all, "fixture-types", storeId] as const,
};

export function useStoreFixtureTypes() {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id ?? "";

  return useQuery({
    queryKey: storeDefaultsKeys.fixtureTypes(storeId),
    queryFn: () => readStoreFixtureTypeLabels(storeId),
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}
