import { useQuery } from "@tanstack/react-query";

import { fetchStoreFixtures } from "@/queries/checker/api/fixtures";
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
    queryFn: async () => {
      const fixtures = await fetchStoreFixtures();
      const uniqueTypes = new Set<string>();

      for (const fixture of fixtures) {
        const type = fixture.type.trim();
        if (!type) continue;
        uniqueTypes.add(type);
      }

      return Array.from(uniqueTypes).sort((a, b) => a.localeCompare(b));
    },
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}
